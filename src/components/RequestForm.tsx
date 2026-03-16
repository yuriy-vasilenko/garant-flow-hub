import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RequestFormProps {
  productTitle?: string;
  compact?: boolean;
}

export const RequestForm = ({ productTitle, compact }: RequestFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', comment: productTitle ? `Интересует: ${productTitle}` : '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('contact_requests').insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      comment: form.comment.trim() || null,
      product_title: productTitle || null,
    });

    setLoading(false);

    if (error) {
      toast.error('Не удалось отправить заявку. Попробуйте позже.');
      console.error('Request submit error:', error);
      return;
    }

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: '', phone: '', comment: '' });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
        <CheckCircle2 className="w-12 h-12 text-status-available" />
        <p className="font-semibold text-foreground text-lg">Заявка отправлена</p>
        <p className="text-muted-foreground text-sm">Мы свяжемся с вами в ближайшее время</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${compact ? '' : 'max-w-md'}`}>
      <Input
        placeholder="Ваше имя"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
        className="bg-card"
      />
      <Input
        placeholder="Телефон"
        type="tel"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
        required
        className="bg-card"
      />
      <Textarea
        placeholder="Комментарий или интересующий товар"
        value={form.comment}
        onChange={e => setForm({ ...form, comment: e.target.value })}
        rows={3}
        className="bg-card resize-none"
      />
      <Button type="submit" className="w-full gap-2">
        <Send className="w-4 h-4" />
        Отправить заявку
      </Button>
    </form>
  );
};
