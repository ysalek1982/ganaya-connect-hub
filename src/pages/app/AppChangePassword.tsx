import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { auth, db } from '@/lib/firebase';

const AppChangePassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Check for strong password
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      toast.error('La contraseña debe incluir mayúsculas, minúsculas y números');
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('No hay sesión activa');
        navigate('/app/login');
        return;
      }

      // Update password in Firebase Auth
      await updatePassword(user, newPassword);

      // Update needsPasswordReset flag in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        needsPasswordReset: false,
        updatedAt: new Date(),
      });

      toast.success('Contraseña actualizada correctamente');
      navigate('/app');
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Por seguridad, debes volver a iniciar sesión');
        // Sign out and redirect to login
        auth.signOut();
        navigate('/app/login');
      } else {
        toast.error(error.message || 'Error al actualizar la contraseña');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Cambiar Contraseña</h1>
            <p className="text-muted-foreground text-sm">
              Por seguridad, debes establecer una nueva contraseña para continuar.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium">La contraseña debe incluir:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li className={newPassword.length >= 8 ? 'text-primary' : ''}>
                  Mínimo 8 caracteres
                </li>
                <li className={/[A-Z]/.test(newPassword) ? 'text-primary' : ''}>
                  Al menos una mayúscula
                </li>
                <li className={/[a-z]/.test(newPassword) ? 'text-primary' : ''}>
                  Al menos una minúscula
                </li>
                <li className={/[0-9]/.test(newPassword) ? 'text-primary' : ''}>
                  Al menos un número
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AppChangePassword;
