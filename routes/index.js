import userRoutes from './users.js';
import projectRoutes from './projects.js';
import taskRoutes from './tasks.js';
import blueprintRoutes from './blueprints.js';
import reportRoutes from './reports.js';
import companyRoutes from './companies.js';
// import dashboardRoutes from './dashboards.js';

const constructorMethod = (app) => {
  app.use('/users', userRoutes);
  app.use('/projects', projectRoutes);
  app.use('/tasks', taskRoutes);
  app.use('/blueprints', blueprintRoutes);
  app.use('/reports', reportRoutes);
  app.use('/companies', companyRoutes);
  // app.use('/dashboards', dashboardRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
};

export default constructorMethod;