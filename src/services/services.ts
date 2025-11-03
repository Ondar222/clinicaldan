import type { ServiceDirection, Doctor } from "../types/services";

export const servicesData: ServiceDirection[] = [
    {
        id: 1,
        slug: "therapy",
        title: "Терапия",
        shortDescription:
            "Диагностика и лечение широкого спектра внутренних заболеваний.",
        fullDescription:
            "Терапевтическое направление занимается первичным приемом пациентов, диагностикой и лечением заболеваний внутренних органов, подбором индивидуальных схем терапии и профилактикой хронических состояний.",
        heroImage: "/bg-hero2.jpg",
        services: [
            {
                id: 101,
                name: "Консультация терапевта",
                description: "Первичный прием, сбор анамнеза и рекомендации.",
                price: 2500,
            },
            {
                id: 102,
                name: "Повторный прием терапевта",
                description: "Коррекция лечения, уточнение диагноза.",
                price: 2000,
            },
        ],
    },
    {
        id: 2,
        slug: "diagnostics",
        title: "Диагностика",
        shortDescription: "Инструментальные и лабораторные исследования для точной диагностики.",
        fullDescription:
            "Диагностическое отделение проводит широкий спектр инструментальных и лабораторных исследований: УЗИ, ЭКГ, ЭЭГ и другие методики.",
        heroImage: "/bg-hero.jpg",
        services: [
            {
                id: 201,
                name: "УЗИ органов брюшной полости",
                description: "Комплексное ультразвуковое исследование.",
                price: 1800,
            },
            {
                id: 202,
                name: "ЭКГ с расшифровкой",
                description: "Исследование сердечной деятельности.",
                price: 900,
            },
        ],
    },
    {
        id: 3,
        slug: "surgery",
        title: "Хирургия",
        shortDescription:
            "Малые хирургические вмешательства и амбулаторные манипуляции.",
        fullDescription:
            "Хирургическое направление выполняет амбулаторные операции, перевязки, удаление новообразований кожи и подслизистых образований с использованием современных методик обезболивания.",
        heroImage: "/bg-hero2.jpg",
        services: [
            {
                id: 301,
                name: "Консультация хирурга",
                description: "Осмотр, постановка предварительного диагноза и план лечения.",
                price: 2700,
            },
            {
                id: 302,
                name: "Удаление новообразования кожи",
                description: "Амбулаторная процедура с гистологией при необходимости.",
                price: 4500,
            },
        ],
    },
    {
        id: 4,
        slug: "gynecology",
        title: "Гинекология",
        shortDescription: "Комплексная помощь женщинам разных возрастов.",
        fullDescription:
            "Гинекологическое направление включает профилактические осмотры, диагностику и лечение заболеваний, планирование беременности и ведение пациенток с хроническими состояниями.",
        heroImage: "/bg-hero.jpg",
        services: [
            {
                id: 401,
                name: "Консультация гинеколога",
                description: "Осмотр, диагностика, рекомендации по лечению.",
                price: 2600,
            },
        ],
    },
    {
        id: 5,
        slug: "urology",
        title: "Урология",
        shortDescription: "Диагностика и лечение заболеваний мочеполовой системы.",
        fullDescription:
            "Урологическое отделение проводит консультации, диагностику и амбулаторные процедуры при заболеваниях почек, мочевого пузыря и мужской репродуктивной системы.",
        heroImage: "/bg-hero2.jpg",
        services: [
            {
                id: 501,
                name: "Консультация уролога",
                description: "Первичный прием уролога.",
                price: 2500,
            },
        ],
    },
    {
        id: 6,
        slug: "physiotherapy",
        title: "Физиотерапия",
        shortDescription: "Восстановительные методики и реабилитация.",
        fullDescription:
            "Физиотерапевтические процедуры направлены на восстановление и реабилитацию после травм и заболеваний, снижение боли и улучшение качества жизни.",
        heroImage: "/bg-hero.jpg",
        services: [
            {
                id: 601,
                name: "Физиотерапевтическая процедура",
                description: "Индивидуально подобранный курс.",
                price: 1200,
            },
        ],
    },
    {
        id: 7,
        slug: "cardiology",
        title: "Кардиология",
        shortDescription: "Диагностика и лечение заболеваний сердца и сосудов.",
        fullDescription:
            "Кардиолог проводит консультации, ЭКГ, функциональные пробы и назначает лечение сердечно-сосудистых заболеваний.",
        heroImage: "/bg-hero2.jpg",
        services: [
            {
                id: 701,
                name: "Прием кардиолога",
                description: "Консультация и интерпретация исследований.",
                price: 3000,
            },
        ],
    },
    {
        id: 8,
        slug: "pediatrics",
        title: "Педиатрия",
        shortDescription: "Профилактика и лечение детских заболеваний.",
        fullDescription:
            "Педиатрическое направление включает наблюдение детей, вакцинацию, лечение острых и хронических заболеваний.",
        heroImage: "/bg-hero.jpg",
        services: [
            {
                id: 801,
                name: "Консультация педиатра",
                description: "Осмотр и рекомендации по уходу и лечению.",
                price: 2400,
            },
        ],
    },
    {
        id: 9,
        slug: "neurology",
        title: "Неврология",
        shortDescription: "Лечение заболеваний нервной системы.",
        fullDescription:
            "Неврологическая помощь при головных болях, невралгиях, нарушениях сна, последствиях травм и инсультов.",
        heroImage: "/bg-hero2.jpg",
        services: [
            {
                id: 901,
                name: "Консультация невролога",
                description: "Первичный прием невролога.",
                price: 2800,
            },
        ],
    },
    {
        id: 10,
        slug: "ophthalmology",
        title: "Офтальмология",
        shortDescription: "Диагностика и лечение заболеваний органов зрения.",
        fullDescription:
            "Проводим диагностику зрения, подбор коррекции, лечение конъюнктивитов и других заболеваний глаз.",
        heroImage: "/bg-hero.jpg",
        services: [
            {
                id: 1001,
                name: "Консультация офтальмолога",
                description: "Диагностика зрения и рекомендации.",
                price: 2300,
            },
        ],
    },
    {
        id: 11,
        slug: "dentistry",
        title: "Стоматология",
        shortDescription: "Лечение зубов и заболеваний полости рта.",
        fullDescription:
            "Стоматологические услуги: терапевтическое лечение, гигиена полости рта, отбеливание и другие процедуры.",
        heroImage: "/bg-hero2.jpg",
        services: [
            {
                id: 1101,
                name: "Консультация стоматолога",
                description: "Осмотр и план лечения.",
                price: 1500,
            },
        ],
    },
    {
        id: 12,
        slug: "endoscopy",
        title: "Эндоскопия",
        shortDescription: "Эндоскопические исследования и процедуры.",
        fullDescription:
            "Проводим гастроскопию, колоноскопию и другие эндоскопические исследования по назначению врача.",
        heroImage: "/bg-hero.jpg",
        services: [
            {
                id: 1201,
                name: "Гастроскопия",
                description: "Эндоскопическое исследование желудка.",
                price: 4500,
            },
        ],
    },
    {
        id: 13,
        slug: "phlebology",
        title: "Флебология",
        shortDescription: "Диагностика и лечение варикозной болезни вен.",
        fullDescription:
            "Современные методики диагностики и лечения варикоза: лазерные технологии, УЗИ-навигация и компрессионная терапия.",
        heroImage: "/bg-hero2.jpg",
        services: [
            {
                id: 1301,
                name: "Лечение варикоза лазером FiberLase-VT",
                description: "Лазерная коагуляция вен на аппарате FiberLase-VT (см. fiberlase-vt.ru). Для лечения варикоза.",
                price: 0,
            },
            {
                id: 1302,
                name: "Лечение варикоза лазером Fotona Dynamis Pro",
                description: "Лазерная терапия на аппарате Fotona Dynamis Pro (см. fotona.ru). Для лечения варикоза.",
                price: 0,
            },
            {
                id: 1303,
                name: "УЗИ вен (Mindray DC-90 / Mindray MX7)",
                description: "Диагностика варикоза на УЗИ Mindray DC-90 и Mindray MX7.",
                price: 0,
            },
            {
                id: 1304,
                name: "Компрессионная терапия (чулки)",
                description: "Подбор и рекомендации по ношению компрессионного трикотажа.",
                price: 0,
            },
        ],
    },
];

export const doctors: Doctor[] = [
    {
        id: 1,
        name: "Иванова Анна Петровна",
        photo: "/doctor-placeholder.jpg",
        experience: 15,
        specializationTitles: ["Терапевт"],
        specializations: [1],
    },
    {
        id: 2,
        name: "Петров Сергей Николаевич",
        photo: "/doctor-placeholder.jpg",
        experience: 12,
        specializationTitles: ["Врач УЗИ"],
        specializations: [2],
    },
    {
        id: 3,
        name: "Сидорова Мария Игоревна",
        photo: "https://www.zdravitsa.ru/upload/services/terapevtPRO.jpg",
        experience: 10,
        specializationTitles: ["Хирург"],
        specializations: [3],
    },
];


