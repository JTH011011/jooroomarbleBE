// src/types/request-with-user.d.ts
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: number;
    email?: string;
    nickname?: string;
  };
}
