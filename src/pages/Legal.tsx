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
              <p><strong>1.1.</strong> Настоящий сайт носит информационный характер и предназначен для предварительного ознакомления с примерами работ и возможными вариантами изготовления памятников.</p>
              <p><strong>1.2.</strong> Деятельность осуществляется физическим лицом, применяющим специальный налоговый режим «Налог на профессиональный доход» (самозанятый) в соответствии с Федеральным законом № 422-ФЗ.</p>
              <p><strong>1.3.</strong> Информация, размещённая на сайте, не является публичной офертой в смысле статьи 437 Гражданского кодекса РФ.</p>
              <p><strong>1.4.</strong> Заключение договора на изготовление памятника осуществляется в устной или письменной форме после индивидуального согласования всех условий с заказчиком.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              2. Предмет договора
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>2.1.</strong> Исполнитель принимает на себя обязательства по изготовлению памятника по индивидуальному заказу клиента, а заказчик обязуется принять выполненную работу и произвести оплату на согласованных условиях.</p>
              <p><strong>2.2.</strong> Каждый памятник изготавливается индивидуально с учётом:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>выбранного материала,</li>
                <li>размеров,</li>
                <li>формы,</li>
                <li>оформления,</li>
                <li>текста и изображений,</li>
                <li>иных параметров, согласованных с заказчиком.</li>
              </ul>
              <p><strong>2.3.</strong> Массовое производство и продажа готовых изделий со склада не осуществляется.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              3. Порядок оформления заказа
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>3.1.</strong> Заказ оформляется путём обращения заказчика через формы обратной связи на сайте, по телефону либо иным согласованным способом.</p>
              <p><strong>3.2.</strong> До начала изготовления стороны согласовывают:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>эскиз изделия,</li>
                <li>материал,</li>
                <li>стоимость работ,</li>
                <li>сроки изготовления,</li>
                <li>порядок оплаты.</li>
              </ul>
              <p><strong>3.3.</strong> После согласования условий заказ считается принятым в работу.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              4. Стоимость работ
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>4.1.</strong> Стоимость изготовления памятника определяется индивидуально и зависит от сложности работ, выбранных материалов и объёма заказа.</p>
              <p><strong>4.2.</strong> Цены, указанные на сайте, носят ориентировочный (ознакомительный) характер и не являются окончательными.</p>
              <p><strong>4.3.</strong> Окончательная стоимость сообщается заказчику до начала выполнения работ.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              5. Порядок оплаты
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>5.1.</strong> Оплата производится напрямую исполнителю после согласования всех условий заказа.</p>
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
              6. Сроки выполнения работ
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>6.1.</strong> Сроки изготовления памятника определяются индивидуально и согласовываются с заказчиком до начала выполнения работ.</p>
              <p><strong>6.2.</strong> Сроки могут быть скорректированы в случае:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>задержки поставки материалов,</li>
                <li>неблагоприятных погодных условий,</li>
                <li>иных технологических или производственных обстоятельств, не зависящих от исполнителя.</li>
              </ul>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              7. Качество и особенности материалов
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>7.1.</strong> Памятники изготавливаются из натуральных материалов, обладающих индивидуальными природными свойствами.</p>
              <p><strong>7.2.</strong> Допускаются незначительные отличия готового изделия от изображений и эскизов по оттенку, текстуре и рисунку камня, что не является дефектом.</p>
              <p><strong>7.3.</strong> Такие отличия обусловлены природными характеристиками материала и технологией обработки.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              8. Приёмка выполненных работ
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>8.1.</strong> Заказчик обязан осмотреть готовое изделие при передаче.</p>
              <p><strong>8.2.</strong> В случае выявления явных недостатков заказчик обязан сообщить об этом исполнителю в момент приёмки либо в разумный срок после передачи изделия.</p>
              <p><strong>8.3.</strong> Претензии, связанные с индивидуальными особенностями материала, не принимаются.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              9. Возврат и обмен
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>9.1.</strong> Все изделия изготавливаются по индивидуальному заказу клиента.</p>
              <p><strong>9.2.</strong> В соответствии с действующим законодательством РФ изделия, изготовленные по индивидуальному заказу, возврату и обмену не подлежат, за исключением случаев обнаружения производственного брака.</p>
              <p><strong>9.3.</strong> В случае выявления брака исполнитель обязуется устранить недостатки либо предложить иное решение по согласованию с заказчиком.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              10. Ответственность сторон
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>10.1.</strong> Стороны несут ответственность в соответствии с действующим законодательством Российской Федерации.</p>
              <p><strong>10.2.</strong> Исполнитель не несёт ответственности за:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>неверно предоставленные заказчиком данные;</li>
                <li>ошибки в тексте, утверждённом заказчиком;</li>
                <li>последствия эксплуатации изделия в ненадлежащих условиях.</li>
              </ul>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              11. Персональные данные
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>11.1.</strong> Персональные данные, переданные заказчиком, используются исключительно для связи и исполнения заказа.</p>
              <p><strong>11.2.</strong> Данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством РФ.</p>
            </div>
          </section>

          <hr className="border-stone-200" />

          <section>
            <h3 className="text-xl font-semibold text-stone-900 mb-3">
              12. Заключительные положения
            </h3>
            <div className="space-y-2 text-stone-700">
              <p><strong>12.1.</strong> Настоящие условия действуют бессрочно и могут быть изменены без предварительного уведомления.</p>
              <p><strong>12.2.</strong> Актуальная версия условий всегда доступна на сайте.</p>
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
              <p>Контактный телефон: ____________________</p>
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
