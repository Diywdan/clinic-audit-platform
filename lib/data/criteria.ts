export type CriterionOption = {
  id: string;
  label: string;
  score: number;
  group?: string;
  groupLabel?: string;
};

export type CriterionCatalogItem = {
  id: string;
  order: number;
  text: string;
  section: string;
  blockId: number;
  type: "single" | "multi";
  isCritical: boolean;
  options: CriterionOption[];
};

export const criteriaCatalog: CriterionCatalogItem[] = [
  {
    id: "criterion-01-benches",
    order: 1,
    text: "Состояние лавочек на прилегающей территории",
    section: "Прилегающая территория",
    blockId: 1,
    type: "single",
    isCritical: false,
    options: [
      { id: "present-working", label: "Лавочки имеются и находятся в исправном состоянии", score: 1 },
      { id: "missing-broken", label: "Лавочки неисправны или отсутствуют", score: -1 }
    ]
  },
  {
    id: "criterion-02-lighting-outside",
    order: 2,
    text: "Освещение на прилегающей территории",
    section: "Прилегающая территория",
    blockId: 1,
    type: "single",
    isCritical: false,
    options: [
      { id: "sufficient", label: "Освещение достаточное", score: 1 },
      { id: "insufficient", label: "Освещение недостаточное", score: -1 }
    ]
  },
  {
    id: "criterion-03-clean-territory",
    order: 3,
    text: "Чистота прилегающей территории",
    section: "Прилегающая территория",
    blockId: 1,
    type: "single",
    isCritical: false,
    options: [
      { id: "clean", label: "Территория чистая и ухоженная, мусор отсутствует", score: 2 },
      { id: "acceptable", label: "Состояние допустимое, есть отдельные замечания", score: 0 },
      { id: "dirty", label: "Территория грязная, присутствует мусор, ямы, неубранные участки", score: -1 }
    ]
  },
  {
    id: "criterion-04-entrance-accessibility",
    order: 4,
    text: "Доступность входа для маломобильных граждан (пандусы)",
    section: "Прилегающая территория",
    blockId: 1,
    type: "single",
    isCritical: true,
    options: [
      { id: "accessible", label: "Вход оборудован удобными пандусами или подъёмниками", score: 0 },
      { id: "hard-to-use", label: "Пандусы есть, но пользоваться ими затруднительно", score: -1 },
      { id: "not-accessible", label: "Пандусы отсутствуют, вход недоступен", score: -1 }
    ]
  },
  {
    id: "criterion-05-parking",
    order: 5,
    text: "Парковка и разметка парковочных мест",
    section: "Прилегающая территория",
    blockId: 1,
    type: "single",
    isCritical: false,
    options: [
      { id: "marked", label: "Парковочные места размечены, в том числе для маломобильных граждан", score: 1 },
      { id: "not-marked", label: "Разметка отсутствует или плохо различима", score: -1 }
    ]
  },
  {
    id: "criterion-06-signage-hours",
    order: 6,
    text: "Указатели и информация о режиме работы",
    section: "Внешние элементы здания",
    blockId: 1,
    type: "single",
    isCritical: false,
    options: [
      { id: "visible", label: "Указатели и график есть, хорошо видны", score: 0 },
      { id: "missing", label: "Указатели или график отсутствуют / плохо видны", score: -1 }
    ]
  },
  {
    id: "criterion-07-fire-exits",
    order: 7,
    text: "Состояние пожарных выходов",
    section: "Внешние элементы здания",
    blockId: 1,
    type: "single",
    isCritical: true,
    options: [
      { id: "working", label: "Пожарные выходы доступны и функционируют", score: 0 },
      { id: "blocked", label: "Пожарные выходы закрыты, заблокированы или недоступны", score: -2 }
    ]
  },
  {
    id: "criterion-08-facade",
    order: 8,
    text: "Состояние фасада здания",
    section: "Внешние элементы здания",
    blockId: 1,
    type: "single",
    isCritical: false,
    options: [
      { id: "clean", label: "Фасад чистый, без видимых повреждений", score: 2 },
      { id: "damaged", label: "Есть осыпающаяся штукатурка или иные повреждения", score: 0 }
    ]
  },
  {
    id: "criterion-09-corridor-cleanliness",
    order: 9,
    text: "Чистота коридоров (полы, стены)",
    section: "Общее состояние коридоров",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "clean", label: "Следы загрязнений отсутствуют (полы и стены чистые, мусора и пыли нет)", score: 1 },
      { id: "dirty", label: "Есть загрязнения, мусор или пыль", score: -1 }
    ]
  },
  {
    id: "criterion-10-bins",
    order: 10,
    text: "Урны для мусора и медотходов",
    section: "Общее состояние коридоров",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "present", label: "Урны для мусора (и медотходов при необходимости) установлены", score: 0 },
      { id: "missing", label: "Урны отсутствуют", score: -1 }
    ]
  },
  {
    id: "criterion-11-smells",
    order: 11,
    text: "Запахи в коридорах",
    section: "Общее состояние коридоров",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "no-smells", label: "Неприятные запахи отсутствуют", score: 0 },
      { id: "smells", label: "Присутствуют неприятные запахи", score: -2 }
    ]
  },
  {
    id: "criterion-12-corridor-lighting",
    order: 12,
    text: "Освещение коридоров",
    section: "Общее состояние коридоров",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "sufficient", label: "Освещение достаточное, тёмных участков нет", score: 1 },
      { id: "insufficient", label: "Освещение недостаточное, имеются тёмные участки", score: -1 }
    ]
  },
  {
    id: "criterion-13-lights-state",
    order: 13,
    text: "Состояние светильников в коридорах",
    section: "Общее состояние коридоров",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "working", label: "Все светильники исправны", score: 1 },
      { id: "broken", label: "Есть неисправные светильники", score: -1 }
    ]
  },
  {
    id: "criterion-14-plumbing",
    order: 14,
    text: "Сантехника",
    section: "Состояние туалетов",
    blockId: 2,
    type: "single",
    isCritical: true,
    options: [
      { id: "working", label: "Унитазы и раковины находятся в исправном состоянии", score: 0 },
      { id: "broken", label: "Есть неисправные унитазы или раковины", score: -2 }
    ]
  },
  {
    id: "criterion-15-dryers",
    order: 15,
    text: "Сушилки / полотенца",
    section: "Состояние туалетов",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "available", label: "Сушилки для рук или полотенца имеются и работают", score: 1 },
      { id: "missing", label: "Сушилки или полотенца отсутствуют либо не работают", score: -1 }
    ]
  },
  {
    id: "criterion-16-toilet-paper",
    order: 16,
    text: "Туалетная бумага",
    section: "Состояние туалетов",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "available", label: "Туалетная бумага имеется", score: 0 },
      { id: "missing", label: "Туалетная бумага отсутствует", score: -2 }
    ]
  },
  {
    id: "criterion-17-accessible-toilets",
    order: 17,
    text: "Туалеты для маломобильных пациентов",
    section: "Состояние туалетов",
    blockId: 2,
    type: "single",
    isCritical: true,
    options: [
      { id: "present", label: "Туалеты для маломобильных пациентов предусмотрены", score: 1 },
      { id: "missing", label: "Туалеты для маломобильных пациентов отсутствуют", score: -1 }
    ]
  },
  {
    id: "criterion-18-stalls-count",
    order: 18,
    text: "Количество кабинок для посетителей",
    section: "Состояние туалетов",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "enough", label: "Количество кабинок для посетителей достаточное", score: 2 },
      { id: "not-enough", label: "Количество кабинок недостаточное", score: 0 }
    ]
  },
  {
    id: "criterion-19-inner-signs",
    order: 19,
    text: "Указатели внутри поликлиники",
    section: "Навигация и информационное оформление",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "clear", label: "Указатели внутри поликлиники понятные и читаемые", score: 1 },
      { id: "unclear", label: "Указатели отсутствуют или плохо читаемы", score: -1 }
    ]
  },
  {
    id: "criterion-20-map",
    order: 20,
    text: "Схема поликлиники",
    section: "Навигация и информационное оформление",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "present", label: "Схема поликлиники размещена и доступна для посетителей", score: 0 },
      { id: "missing", label: "Схема поликлиники отсутствует", score: -1 }
    ]
  },
  {
    id: "criterion-21-labels",
    order: 21,
    text: "Таблички и надписи",
    section: "Навигация и информационное оформление",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "readable", label: "Надписи и таблички разборчивые (крупный шрифт, контрастные цвета)", score: 1 },
      { id: "hard-to-read", label: "Надписи трудно читаемы", score: -1 }
    ]
  },
  {
    id: "criterion-22-low-vision",
    order: 22,
    text: "Информация для слабовидящих",
    section: "Навигация и информационное оформление",
    blockId: 2,
    type: "single",
    isCritical: false,
    options: [
      { id: "present", label: "Тактильные таблички или элементы навигации для слабовидящих имеются", score: 1 },
      { id: "missing", label: "Тактильные элементы навигации отсутствуют", score: 0 }
    ]
  },
  {
    id: "criterion-23-passageways",
    order: 23,
    text: "Проходы",
    section: "Безопасность и удобство передвижения",
    blockId: 2,
    type: "single",
    isCritical: true,
    options: [
      { id: "free", label: "Проходы свободны и не загромождены", score: 1 },
      { id: "blocked", label: "Проходы загромождены, имеются препятствия", score: -1 }
    ]
  },
  {
    id: "criterion-24-floor-cover",
    order: 24,
    text: "Покрытие пола",
    section: "Безопасность и удобство передвижения",
    blockId: 2,
    type: "single",
    isCritical: true,
    options: [
      { id: "anti-slip", label: "Противоскользящее покрытие пола предусмотрено", score: 2 },
      { id: "none", label: "Противоскользящее покрытие отсутствует", score: 0 }
    ]
  },
  {
    id: "criterion-25-mobility-inside",
    order: 25,
    text: "Передвижение маломобильных пациентов",
    section: "Безопасность и удобство передвижения",
    blockId: 2,
    type: "single",
    isCritical: true,
    options: [
      { id: "convenient", label: "Передвижение по коридорам удобно для маломобильных пациентов", score: 1 },
      { id: "difficult", label: "Передвижение для маломобильных пациентов затруднено", score: 0 }
    ]
  },
  {
    id: "criterion-26-equipment",
    order: 26,
    text: "Рабочее состояние оборудования",
    section: "Оснащение и оборудование",
    blockId: 3,
    type: "single",
    isCritical: true,
    options: [
      { id: "working", label: "Всё оборудование исправно, используется корректно", score: 2 },
      { id: "broken", label: "Есть сломанное / устаревшее оборудование", score: -1 }
    ]
  },
  {
    id: "criterion-27-consumables",
    order: 27,
    text: "Стерильные и новые расходные материалы (перчатки, салфетки, шприцы)",
    section: "Оснащение и оборудование",
    blockId: 3,
    type: "single",
    isCritical: true,
    options: [
      { id: "present", label: "Расходные материалы в наличии, стерильные", score: 2 },
      { id: "missing", label: "Расходные материалы отсутствуют или вызывают сомнение", score: -2 }
    ]
  },
  {
    id: "criterion-28-couch",
    order: 28,
    text: "Наличие чистой кушетки / стола для осмотра",
    section: "Комфорт для пациента",
    blockId: 3,
    type: "single",
    isCritical: false,
    options: [
      { id: "present", label: "Кушетка (стол) есть, чистая, используется", score: 2 },
      { id: "missing", label: "Кушетки нет или она в неудовлетворительном состоянии", score: -1 }
    ]
  },
  {
    id: "criterion-29-personal-items",
    order: 29,
    text: "Наличие места для личных вещей пациента (стул, вешалка)",
    section: "Комфорт для пациента",
    blockId: 3,
    type: "single",
    isCritical: false,
    options: [
      { id: "present", label: "Есть место для размещения личных вещей", score: 1 },
      { id: "missing", label: "Места для личных вещей нет", score: -1 }
    ]
  },
  {
    id: "criterion-30-door-info",
    order: 30,
    text: "Информация на двери кабинета (ФИО врача, специальность, график приёма)",
    section: "Время приёма и соблюдение графика",
    blockId: 3,
    type: "single",
    isCritical: false,
    options: [
      { id: "present", label: "Информация размещена и читаема", score: 0 },
      { id: "missing", label: "Информация отсутствует или не читается", score: -1 }
    ]
  },
  {
    id: "criterion-31-appointment-duration",
    order: 31,
    text: "Продолжительность приёма",
    section: "Время приёма и соблюдение графика",
    blockId: 3,
    type: "single",
    isCritical: false,
    options: [
      { id: "enough", label: "Врач проводит приём без спешки, уделяет достаточное время", score: 2 },
      { id: "formal", label: "Приём формальный, врач торопится", score: 0 }
    ]
  },
  {
    id: "criterion-32-polite",
    order: 32,
    text: "Врач общается вежливо и корректно (без грубости, резких высказываний)",
    section: "Качество осмотра у врача",
    blockId: 4,
    type: "single",
    isCritical: false,
    options: [
      { id: "yes", label: "Да", score: 1 },
      { id: "no", label: "Нет", score: -1 }
    ]
  },
  {
    id: "criterion-33-answers-questions",
    order: 33,
    text: "Врач отвечает на вопросы пациента, не игнорирует обращения",
    section: "Качество осмотра у врача",
    blockId: 4,
    type: "single",
    isCritical: false,
    options: [
      { id: "yes", label: "Да", score: 2 },
      { id: "no", label: "Нет", score: -1 }
    ]
  },
  {
    id: "criterion-34-confidentiality",
    order: 34,
    text: "Соблюдается конфиденциальность, корректность, тактичность",
    section: "Качество осмотра у врача",
    blockId: 4,
    type: "single",
    isCritical: true,
    options: [
      { id: "yes", label: "Да", score: 1 },
      { id: "no", label: "Нет", score: -1 }
    ]
  },
  {
    id: "criterion-35-follow-up",
    order: 35,
    text: "Врач задаёт уточняющие вопросы, проводит необходимые действия осмотра",
    section: "Качество осмотра у врача",
    blockId: 4,
    type: "single",
    isCritical: false,
    options: [
      { id: "yes", label: "Да", score: 2 },
      { id: "no", label: "Нет", score: 0 }
    ]
  },
  {
    id: "criterion-36-no-upsell",
    order: 36,
    text: "Обследования и анализы назначаются по медицинским показаниям (нет признаков навязывания платных услуг)",
    section: "Качество осмотра у врача",
    blockId: 4,
    type: "single",
    isCritical: true,
    options: [
      { id: "yes", label: "Да", score: 2 },
      { id: "no", label: "Нет", score: -1 }
    ]
  },
  {
    id: "criterion-37-no-informal-payment",
    order: 37,
    text: "Не выявлены требования «благодарности», неформальной оплаты",
    section: "Доступность и прозрачность услуг",
    blockId: 4,
    type: "single",
    isCritical: true,
    options: [
      { id: "yes", label: "Да", score: 1 },
      { id: "no", label: "Нет", score: -2 }
    ]
  },
  {
    id: "criterion-38-sick-leave",
    order: 38,
    text: "Справки и больничные выдаются только после осмотра врача",
    section: "Доступность и прозрачность услуг",
    blockId: 4,
    type: "single",
    isCritical: true,
    options: [
      { id: "yes", label: "Да", score: 1 },
      { id: "no", label: "Нет", score: -2 }
    ]
  },
  {
    id: "criterion-39-hidden-payments",
    order: 39,
    text: "Информация размещена и понятна, скрытых платежей нет",
    section: "Доступность и прозрачность услуг",
    blockId: 4,
    type: "single",
    isCritical: false,
    options: [
      { id: "yes", label: "Да", score: 1 },
      { id: "no", label: "Нет", score: -1 }
    ]
  },
  {
    id: "criterion-40-no-priority",
    order: 40,
    text: "Не выявлены признаки приёма «по знакомству» вне очереди",
    section: "Доступность и прозрачность услуг",
    blockId: 4,
    type: "single",
    isCritical: false,
    options: [
      { id: "yes", label: "Да", score: 1 },
      { id: "no", label: "Нет", score: -1 }
    ]
  },
  {
    id: "criterion-41-medical-records",
    order: 41,
    text: "Пациент может получить информацию из медкарты в установленном порядке",
    section: "Доступность и прозрачность услуг",
    blockId: 4,
    type: "single",
    isCritical: false,
    options: [
      { id: "yes", label: "Да", score: 1 },
      { id: "no", label: "Нет", score: -1 }
    ]
  },
  {
    id: "criterion-42-feedback-channels",
    order: 42,
    text: "В учреждении доступны: телефон доверия / книга жалоб / электронные обращения",
    section: "Обратная связь и решение проблем",
    blockId: 4,
    type: "single",
    isCritical: false,
    options: [
      { id: "yes", label: "Да", score: 1 },
      { id: "no", label: "Нет", score: -2 }
    ]
  },
  {
    id: "criterion-43-feedback-processing",
    order: 43,
    text: "Обращения фиксируются и рассматриваются (не игнорируются)",
    section: "Обратная связь и решение проблем",
    blockId: 4,
    type: "single",
    isCritical: false,
    options: [
      { id: "yes", label: "Да", score: 2 },
      { id: "no", label: "Нет", score: -1 }
    ]
  },
  {
    id: "criterion-44-chief-access",
    order: 44,
    text: "Есть возможность обратиться к заведующему / главному врачу",
    section: "Обратная связь и решение проблем",
    blockId: 4,
    type: "single",
    isCritical: false,
    options: [
      { id: "yes", label: "Да", score: 2 },
      { id: "no", label: "Нет", score: -1 }
    ]
  },
  {
    id: "criterion-45-appointment-channels",
    order: 45,
    text: "Какие способы записи к врачу доступны в медицинском учреждении?",
    section: "Запись к врачу",
    blockId: 4,
    type: "multi",
    isCritical: false,
    options: [
      {
        id: "gosuslugi-available",
        group: "gosuslugi",
        groupLabel: "Через Госуслуги (в течение 2 недель)",
        label: "Доступно",
        score: 1
      },
      {
        id: "gosuslugi-unavailable",
        group: "gosuslugi",
        groupLabel: "Через Госуслуги (в течение 2 недель)",
        label: "Недоступно",
        score: -2
      },
      {
        id: "registry-available",
        group: "registry",
        groupLabel: "Очная запись в регистратуре",
        label: "Доступна",
        score: 0
      },
      {
        id: "registry-unavailable",
        group: "registry",
        groupLabel: "Очная запись в регистратуре",
        label: "Недоступна",
        score: -1
      },
      {
        id: "electronic-available",
        group: "electronic",
        groupLabel: "Электронная очередь / электронная запись",
        label: "Доступна",
        score: 1
      },
      {
        id: "electronic-unavailable",
        group: "electronic",
        groupLabel: "Электронная очередь / электронная запись",
        label: "Недоступна",
        score: -1
      },
      {
        id: "phone-available",
        group: "phone",
        groupLabel: "Запись по телефону",
        label: "Доступна",
        score: 1
      },
      {
        id: "phone-unavailable",
        group: "phone",
        groupLabel: "Запись по телефону",
        label: "Недоступна",
        score: -1
      }
    ]
  }
];

export const criteriaSeed = criteriaCatalog.map(({ id, text, section, blockId, type, isCritical }) => ({
  id,
  text,
  section,
  blockId,
  type,
  isCritical
}));

export const criteriaCatalogMap = new Map(criteriaCatalog.map((criterion) => [criterion.id, criterion]));
