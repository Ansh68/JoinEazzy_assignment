import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { Analytics } from '../pages/admin/Analytics';
import { AssignmentDetail } from '../pages/admin/AssignmentDetail';
import { AssignmentForm } from '../pages/admin/AssignmentForm';
import { GroupsOverview } from '../pages/admin/GroupsOverview';
import { ManageAssignments } from '../pages/admin/ManageAssignments';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { NotFound } from '../pages/NotFound';
import { MyGroup } from '../pages/student/MyGroup';
import { StudentAssignments } from '../pages/student/StudentAssignments';
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { HOME_PATHS, ROLES } from '../utils/constants';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { RoleRoute } from './RoleRoute';

// "/" sends visitors to their dashboard, or to the login page if they're logged out.
function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? HOME_PATHS[user.role] : '/login'} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute role={ROLES.STUDENT} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/group" element={<MyGroup />} />
        </Route>

        <Route element={<RoleRoute role={ROLES.ADMIN} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/assignments" element={<ManageAssignments />} />
          <Route path="/admin/assignments/new" element={<AssignmentForm />} />
          <Route path="/admin/assignments/:id" element={<AssignmentDetail />} />
          <Route path="/admin/assignments/:id/edit" element={<AssignmentForm />} />
          <Route path="/admin/groups" element={<GroupsOverview />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
