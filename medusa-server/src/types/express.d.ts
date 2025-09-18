import { Router } from 'express';

declare global {
  namespace Express {
    interface Request {
      app: Application;
    }

    interface Application {
      router?: Router; // Make it optional and type it as Router
    }
  }
}
