import { Router, RequestHandler } from 'express';
import { AuthController } from '../controllers/AuthController';
import {validateRequest} from '../middleware/validationMiddleware';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';
import { authenticate } from '../middleware/authMiddleware';




const router = Router();
const authController = new AuthController();


router.post('/register', validateRequest(RegisterDto), authController.register as RequestHandler);

router.post('/login', validateRequest(LoginDto), authController.login as RequestHandler);

router.get('/logout', authenticate as RequestHandler, authController.logout as RequestHandler);

router.get('/session', authenticate as RequestHandler, authController.session as RequestHandler)

router.get('/refresh', authenticate as RequestHandler, authController.refreshToken as RequestHandler)




export default router;