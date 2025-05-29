import { Router, RequestHandler } from 'express';
import { RoleController } from '../controllers/RoleController';

const router = Router();
const roleController = new RoleController();

router.post('/add-role', roleController.createRole as RequestHandler);


router.get('/all', roleController.getAllRoles as RequestHandler);

router.post('/update-role', roleController.updateRole as RequestHandler);



export default router;