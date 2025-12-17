import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Legal() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors">
            <Icon name="ArrowLeft" size={20} />
            <span>На главную</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-8">
          Правовая информация
        </h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-stone-900 mb-4">
              Условия оказания услуг по изготовлению памятников
            </h2>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              1. Общие положения
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>1.1.</strong> Настоящий сайт носит информационный характер и предназначен для предварительного ознакомления с примерами работ и вариантами оформления памятников.</p>
              <p><strong>1.2.</strong> Деятельность осуществляется физическим лицом, применяющим специальный налоговый режим «Налог на профессиональный доход» (самозанятый) в соответствии с Федеральным законом № 422-ФЗ.</p>
              <p><strong>1.3.</strong> Информация, размещённая на сайте, не является публичной офертой в смысле статьи 437 Гражданского кодекса РФ.</p>
              <p><strong>1.4.</strong> Заключение договора на изготовление памятника осуществляется после индивидуального согласования всех условий с заказчиком.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              2. Предмет оказания услуг
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>2.1.</strong> Исполнитель оказывает услуги по изготовлению памятников по индивидуальному заказу клиента.</p>
              <p><strong>2.2.</strong> Каждый памятник изготавливается с учётом согласованных параметров: материала, размеров, формы, оформления, текстов и изображений.</p>
              <p><strong>2.3.</strong> Массовое производство и продажа готовых изделий со склада не осуществляется.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              3. Порядок оформления заказа
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>3.1.</strong> Заказ оформляется путём обращения заказчика через сайт, по телефону либо иным согласованным способом.</p>
              <p><strong>3.2.</strong> До начала выполнения работ стороны согласовывают:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>параметры изделия;</li>
                <li>эскиз;</li>
                <li>ориентировочную стоимость;</li>
                <li>сроки изготовления;</li>
                <li>порядок оплаты.</li>
              </ul>
              <p><strong>3.3.</strong> После согласования условий заказ считается принятым в работу.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              4. Стоимость услуг и формирование цены
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>4.1.</strong> Стоимость услуг по изготовлению памятников определяется индивидуально и зависит от:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>выбранного материала;</li>
                <li>размеров изделия;</li>
                <li>сложности работ;</li>
                <li>объёма декоративных элементов;</li>
                <li>иных согласованных параметров.</li>
              </ul>
              <p><strong>4.2.</strong> Стоимость, указанная на сайте, носит ориентировочный (информационный) характер и указывается в формате «цена от».</p>
              <p><strong>4.3.</strong> Указание стоимости в формате «от» означает минимальную возможную стоимость выполнения работ при базовых параметрах изделия.</p>
              <p><strong>4.4.</strong> Окончательная стоимость определяется после согласования всех параметров заказа и доводится до сведения заказчика до начала выполнения работ.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              5. Порядок оплаты
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>5.1.</strong> Оплата производится напрямую исполнителю после согласования условий заказа.</p>
              <p><strong>5.2.</strong> Возможные способы оплаты:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>наличный расчёт;</li>
                <li>перевод денежных средств по согласованию сторон.</li>
              </ul>
              <p><strong>5.3.</strong> Онлайн-оплата на сайте не осуществляется.</p>
              <p><strong>5.4.</strong> После получения оплаты исполнитель формирует чек в соответствии с требованиями Федеральной налоговой службы РФ.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              6. Сроки выполнения услуг
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>6.1.</strong> Сроки изготовления памятника согласовываются индивидуально до начала выполнения работ.</p>
              <p><strong>6.2.</strong> Сроки могут быть изменены в случае возникновения обстоятельств, не зависящих от исполнителя, включая особенности поставки материалов и погодные условия.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              7. Особенности материалов и внешнего вида
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>7.1.</strong> Памятники изготавливаются из натуральных материалов, обладающих индивидуальными природными свойствами.</p>
              <p><strong>7.2.</strong> Допускаются незначительные отличия готового изделия от изображений и эскизов по оттенку, текстуре и рисунку материала.</p>
              <p><strong>7.3.</strong> Указанные отличия не являются недостатком или браком.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              8. Приёмка выполненных работ
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>8.1.</strong> Заказчик обязан осмотреть готовое изделие при передаче.</p>
              <p><strong>8.2.</strong> Претензии по явным недостаткам должны быть заявлены в разумный срок после получения изделия.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              9. Возврат и обмен
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>9.1.</strong> Все изделия изготавливаются по индивидуальному заказу клиента.</p>
              <p><strong>9.2.</strong> В соответствии с действующим законодательством РФ изделия, изготовленные по индивидуальному заказу, возврату и обмену не подлежат, за исключением случаев выявления производственного брака.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              10. Ответственность сторон
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>10.1.</strong> Стороны несут ответственность в соответствии с действующим законодательством РФ.</p>
              <p><strong>10.2.</strong> Исполнитель не несёт ответственности за ошибки в данных и текстах, предоставленных и утверждённых заказчиком.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              11. Персональные данные
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>11.1.</strong> Персональные данные заказчика используются исключительно для связи и исполнения заказа.</p>
              <p><strong>11.2.</strong> Данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством РФ.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              12. Заключительные положения
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>12.1.</strong> Настоящие условия действуют бессрочно.</p>
              <p><strong>12.2.</strong> Актуальная версия условий размещается на сайте исполнителя.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section className="bg-stone-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Icon name="Lock" size={20} />
              Реквизиты исполнителя
            </h3>
            <div className="space-y-2 text-stone-700">
              <p className="font-medium">Исполнитель: Физическое лицо, применяющее специальный налоговый режим «Налог на профессиональный доход» (самозанятый)</p>
              <p>ФИО: ____________________</p>
              <p>ИНН: ____________________</p>
              <p>Телефон: ____________________</p>
              <p>Email: ____________________</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-stone-600">
          <p>© 2025 Изготовление памятников. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
