import { PageLayout, PageHeader } from '@/components/layout/PageLayout';

const Privacy = () => (
  <PageLayout>
    <PageHeader
      title="Политика конфиденциальности"
      breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Политика конфиденциальности' }]}
    />
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-card rounded-xl p-6 border border-border space-y-4 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-lg font-bold text-foreground">1. Общие положения</h2>
          <p>Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта Гарант Маркет (далее — Сайт).</p>

          <h2 className="text-lg font-bold text-foreground">2. Какие данные мы собираем</h2>
          <p>При отправке заявки через формы на Сайте мы можем собирать следующие данные: имя, номер телефона, содержание обращения.</p>

          <h2 className="text-lg font-bold text-foreground">3. Цели обработки</h2>
          <p>Данные используются исключительно для связи с пользователем, обработки заявки, уточнения деталей заказа и предоставления консультации.</p>

          <h2 className="text-lg font-bold text-foreground">4. Защита данных</h2>
          <p>Мы принимаем необходимые организационные и технические меры для защиты персональных данных от неправомерного доступа, изменения, раскрытия или уничтожения.</p>

          <h2 className="text-lg font-bold text-foreground">5. Передача третьим лицам</h2>
          <p>Персональные данные пользователей не передаются третьим лицам, за исключением случаев, предусмотренных законодательством.</p>

          <h2 className="text-lg font-bold text-foreground">6. Контакты</h2>
          <p>По вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам через Telegram: <a href="https://t.me/garantmarketdn" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">@garantmarketdn</a>.</p>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default Privacy;
