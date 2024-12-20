export interface UserProfileResponse {
  id: string;
  email?: string;
  name?: string;
  date_of_birth?: Date;
  businessType?: string;
  profileImageUrl?: string;
  phoneNumber: string;
  aadhaarNumber?: string;
  panNumber?: string;
  plan?: string;
  referralCode?: string;
  planPrice?: number;
  metadata?: any;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
