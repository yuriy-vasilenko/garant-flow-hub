import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLayout, PageHeader } from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { isSiteAdmin, loginSiteAdmin, logoutSiteAdmin } from '@/lib/adminAuth';
import { LayoutDashboard, LogOut } from 'lucide-react';

const Cabinet = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (loginSiteAdmin(username, password)) {
      toast.success('Добро пожаловать');
      navigate('/admin', { replace: true });
      return;
    }
    toast.error('Неверный логин или пароль');
  };

  if (isSiteAdmin()) {
    return (
      <PageLayout>
        <PageHeader
          title="Личный кабинет"
          description="Управление каталогом доступно в админ-панели."
          breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Личный кабинет' }]}
        />
        <section className="py-10">
          <div className="container mx-auto px-4 max-w-lg space-y-4">
            <Link
              to="/admin"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              Админ-панель
            </Link>
            <button
              type="button"
              onClick={() => {
                logoutSiteAdmin();
                toast.success('Вы вышли');
                navigate('/', { replace: true });
              }}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-secondary transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Выйти
            </button>
          </div>
        </section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Вход в личный кабинет"
        description="Введите логин и пароль администратора."
        breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Вход' }]}
      />
      <section className="py-10">
        <div className="container mx-auto px-4">
          <form onSubmit={handleLogin} className="max-w-md mx-auto bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
            <Input placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required className="h-11" />
            <Input
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-11"
            />
            <button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Войти
            </button>
          </form>
        </div>
      </section>
    </PageLayout>
  );
};

export default Cabinet;
