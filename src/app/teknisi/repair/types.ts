export interface RepairRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  department: string;
  location: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'need_parts' | 'completed' | 'rejected';
  submitDate: Date;
  assignedTo?: string;
  assignedDate?: Date;
  startDate?: Date;
  completionDate?: Date;
  images?: string[];
  notes?: string[];
  requiredParts?: {
    itemId: string;
    itemName: string;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
  }[];
}

export interface RepairNote {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  timestamp: Date;
  type: 'update' | 'comment' | 'status_change' | 'parts_request';
}