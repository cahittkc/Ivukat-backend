import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

router.post('/', userController.createUser as RequestHandler);

router.get('/user-list', userController.getAllUsers as RequestHandler);

router.post('/get-company-employees', userController.getCompanyEmployees as RequestHandler);
router.post('/get-company-owners', userController.getCompanyOwners as RequestHandler);

router.get('/:id', userController.getUserById as RequestHandler);



export default router;