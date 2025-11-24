import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topics, TopicsDocument } from '../../topics/topics.schema';

/**
 * Servicio centralizado para manejar el flujo de aprobación de contenido
 * Gestiona estados: draft, pending_approval, approved, rejected, editing, deleted
 * 
 * FLUJO:
 * 1. Maestro crea tema → draft
 * 2. Maestro envía a revisión → pending_approval
 * 3. Admin aprueba → approved
 * 4. Admin rechaza → rejected (maestro puede editar y reenviar)
 * 5. Maestro solicita edición de tema aprobado → edit_request_pending
 * 6. Admin aprueba solicitud → editing (maestro puede editar)
 * 7. Maestro reenvía → pending_approval
 */
@Injectable()
export class ApprovalService {
  constructor(
    @InjectModel(Topics.name) private topicsModel: Model<TopicsDocument>,
  ) {}

  // ==================== TOPICS ====================

  async submitTopicForReview(topicId: string, userId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    // Verificar que el usuario sea el creador o colaborador
    const isOwner = topic.created_by?.toString() === userId;
    const isCollaborator = topic.edit_permissions?.some(uid => uid.toString() === userId);
    
    if (!isOwner && !isCollaborator) {
      throw new BadRequestException('Only the creator or collaborators can submit this topic for review');
    }

    // Verificar que esté en estado editable
    const editableStates = ['draft', 'editing', 'rejected'];
    if (!editableStates.includes(topic.status)) {
      throw new BadRequestException(`Topic cannot be submitted. Current status: ${topic.status}`);
    }

    topic.status = 'pending_approval';
    topic.edit_request_pending = false;
    
    // Agregar a historial
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: userId as any,
      action: 'submitted_for_review'
    });
    
    await topic.save();

    return topic;
  }

  async approveTopic(topicId: string, adminId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    if (topic.status !== 'pending_approval') {
      throw new BadRequestException(`Topic is not pending approval. Current status: ${topic.status}`);
    }

    topic.status = 'approved';
    
    // Agregar a historial
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: adminId as any,
      action: 'approved'
    });
    
    await topic.save();

    return topic;
  }

  async rejectTopic(topicId: string, adminId: string, reason?: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    if (topic.status !== 'pending_approval') {
      throw new BadRequestException(`Topic is not pending approval. Current status: ${topic.status}`);
    }

    topic.status = 'rejected';
    
    // Agregar a historial con razón de rechazo
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: adminId as any,
      action: `rejected${reason ? ': ' + reason : ''}`
    });
    
    await topic.save();

    return topic;
  }

  async requestEditPermission(topicId: string, userId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    // Verificar que el usuario sea el creador o colaborador
    const isOwner = topic.created_by?.toString() === userId;
    const isCollaborator = topic.edit_permissions?.some(uid => uid.toString() === userId);
    
    if (!isOwner && !isCollaborator) {
      throw new BadRequestException('Only the creator or collaborators can request edit permission');
    }

    if (topic.status !== 'approved') {
      throw new BadRequestException(`Can only request edit permission for approved topics. Current status: ${topic.status}`);
    }

    if (topic.edit_request_pending) {
      throw new BadRequestException('There is already a pending edit request for this topic');
    }

    topic.edit_request_pending = true;
    topic.edit_requested_by = userId as any;
    topic.edit_requested_at = new Date();
    
    // Agregar a historial
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: userId as any,
      action: 'requested_edit_permission'
    });
    
    await topic.save();

    return topic;
  }

  async approveEditRequest(topicId: string, adminId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    if (!topic.edit_request_pending) {
      throw new BadRequestException('No pending edit request for this topic');
    }

    topic.status = 'editing';
    topic.edit_request_pending = false;
    
    // Agregar a historial
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: adminId as any,
      action: 'approved_edit_request'
    });
    
    await topic.save();

    return topic;
  }

  async rejectEditRequest(topicId: string, adminId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    if (!topic.edit_request_pending) {
      throw new BadRequestException('No pending edit request for this topic');
    }

    topic.edit_request_pending = false;
    topic.edit_requested_by = undefined;
    topic.edit_requested_at = undefined;
    
    // Agregar a historial
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: adminId as any,
      action: 'rejected_edit_request'
    });
    
    await topic.save();

    return topic;
  }

  async deleteTopic(topicId: string, userId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    topic.status = 'deleted';
    topic.is_deleted = true;
    topic.deleted_at = new Date();
    topic.deleted_by = userId as any;
    
    // Agregar a historial
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: userId as any,
      action: 'deleted'
    });
    
    await topic.save();

    return topic;
  }

  async restoreTopic(topicId: string, adminId: string): Promise<Topics> {
    const topic = await this.topicsModel.findById(topicId).exec();
    
    if (!topic) {
      throw new NotFoundException(`Topic with id ${topicId} not found`);
    }

    if (!topic.is_deleted) {
      throw new BadRequestException('Topic is not deleted');
    }

    topic.status = 'draft';
    topic.is_deleted = false;
    topic.deleted_at = undefined;
    topic.deleted_by = undefined;
    
    // Agregar a historial
    if (!topic.history) topic.history = [];
    topic.history.push({
      date: new Date(),
      user: adminId as any,
      action: 'restored'
    });
    
    await topic.save();

    return topic;
  }

  async getPendingTopics(): Promise<Topics[]> {
    return this.topicsModel
      .find({ status: 'pending_approval' })
      .populate('created_by', 'user_name email profile')
      .populate('edit_permissions', 'user_name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getEditRequests(): Promise<Topics[]> {
    return this.topicsModel
      .find({ edit_request_pending: true })
      .populate('created_by', 'user_name email profile')
      .populate('edit_requested_by', 'user_name email')
      .populate('edit_permissions', 'user_name email')
      .sort({ edit_requested_at: -1 })
      .exec();
  }

  async getDeletedTopics(): Promise<Topics[]> {
    return this.topicsModel
      .find({ is_deleted: true })
      .populate('created_by', 'user_name email profile')
      .populate('deleted_by', 'user_name email')
      .sort({ deleted_at: -1 })
      .exec();
  }

  // ==================== ESTADÍSTICAS ====================

  async getApprovalStats(): Promise<any> {
    const [
      draftTopics,
      pendingTopics,
      approvedTopics,
      editingTopics,
      rejectedTopics,
      deletedTopics,
      editRequests
    ] = await Promise.all([
      this.topicsModel.countDocuments({ status: 'draft' }),
      this.topicsModel.countDocuments({ status: 'pending_approval' }),
      this.topicsModel.countDocuments({ status: 'approved' }),
      this.topicsModel.countDocuments({ status: 'editing' }),
      this.topicsModel.countDocuments({ status: 'rejected' }),
      this.topicsModel.countDocuments({ is_deleted: true }),
      this.topicsModel.countDocuments({ edit_request_pending: true })
    ]);

    return {
      topics: {
        draft: draftTopics,
        pending: pendingTopics,
        approved: approvedTopics,
        editing: editingTopics,
        rejected: rejectedTopics,
        deleted: deletedTopics,
        editRequests: editRequests,
        total: draftTopics + pendingTopics + approvedTopics + editingTopics + rejectedTopics
      }
    };
  }
}
