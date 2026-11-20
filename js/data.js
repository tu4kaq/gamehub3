/* ============================================================
   GameHub · data.js
   Централизованный демо-каталог. Чтобы добавить игру — просто
   допишите объект в массив games (изображения подтянутся со
   Steam CDN по app id; при ошибке покажется градиентная обложка).
   Оценки и индексы популярности — демонстрационные.
   ============================================================ */
(function (global) {
  'use strict';

  var GENRES = [
    { id: 'Action',     ru: 'Экшен',      color: '#FB923C', icon: 'sword' },
    { id: 'Adventure',  ru: 'Приключения', color: '#2DD4BF', icon: 'compass' },
    { id: 'RPG',        ru: 'Ролевые',     color: '#A78BFA', icon: 'd20' },
    { id: 'Racing',     ru: 'Гонки',       color: '#FBBF24', icon: 'flag' },
    { id: 'Shooter',    ru: 'Шутеры',      color: '#38BDF8', icon: 'crosshair' },
    { id: 'Horror',     ru: 'Хоррор',      color: '#F43F5E', icon: 'ghost' },
    { id: 'Strategy',   ru: 'Стратегии',   color: '#A3E635', icon: 'castle' },
    { id: 'Simulation', ru: 'Симуляторы',  color: '#60A5FA', icon: 'cpu' },
    { id: 'Sports',     ru: 'Спорт',       color: '#4ADE80', icon: 'trophy' },
    { id: 'Indie',      ru: 'Инди',        color: '#E879F9', icon: 'sparkles' }
  ];

  var PLATFORMS = [
    { id: 'pc',          label: 'PC',             icon: 'monitor' },
    { id: 'playstation', label: 'PlayStation',    icon: 'gamepad' },
    { id: 'xbox',        label: 'Xbox',           icon: 'xbox' },
    { id: 'switch',      label: 'Nintendo Switch', icon: 'switch' }
  ];

  /* tier: ориентировочный класс системных требований */
  var games = [
    { id: 'cyberpunk-2077', app: 1091500, title: 'Cyberpunk 2077', dev: 'CD Projekt RED', pub: 'CD Projekt', year: 2020, released: '2020-12-10',
      genres: ['RPG', 'Action'], platforms: ['pc', 'playstation', 'xbox'], age: '18+', rating: 4.5, popularity: 96, storage: 70, tier: 'high', trailer: 'qIcTM8WXFjk',
      short: 'Ролевая игра в открытом мире Найт-Сити — города, одержимого властью и аугментациями.',
      full: 'Найт-Сити — мегаполис будущего, где корпорации решают всё, а импланты стирают грань между человеком и машиной. Вы играете за V — наёмника в поисках импланта, дарующего бессмертие. Нелинейный сюжет, десятки финалов, культовые персонажи и город, в котором хочется потеряться на сотни часов.',
      tags: ['Открытый мир', 'Сюжет', 'Киберпанк', 'От первого лица'] },

    { id: 'witcher-3', app: 292030, title: 'The Witcher 3: Wild Hunt', dev: 'CD Projekt RED', pub: 'CD Projekt', year: 2015, released: '2015-05-18',
      genres: ['RPG', 'Adventure'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '18+', rating: 4.8, popularity: 90, storage: 50, tier: 'mid', trailer: null,
      short: 'Ведьмак Геральт ищет приёмную дочь в огромном мире, охваченном войной.',
      full: 'Вы — Геральт из Ривии, наёмный охотник на чудовищ. Впереди — поиски Цири, девушки-предназначения, за которой охотится Дикая Охота. Контракты, интриги, славянское тёмное фэнтези и квесты, которые запоминаются лучше многих фильмов. Издание «Дикая Охота» включает оба крупных дополнения.',
      tags: ['Открытый мир', 'Фэнтези', 'Сюжет', 'Выбор и последствия'] },

    { id: 'elden-ring', app: 1245620, title: 'ELDEN RING', dev: 'FromSoftware', pub: 'Bandai Namco', year: 2022, released: '2022-02-25',
      genres: ['RPG', 'Action'], platforms: ['pc', 'playstation', 'xbox'], age: '16+', rating: 4.7, popularity: 92, storage: 60, tier: 'mid', trailer: 'E3Huy2cdih0',
      short: 'Тёмное фэнтези Хидетаки Миядзаки и Джорджа Мартина в бесшовном открытом мире.',
      full: 'Междуземье — огромный мир под властью осколков Кольца Элден. Станьте Погасшим, обретите благодать и бросьте вызов полубогам. Свобода исследования, десятки билдов, верхом на Torrent — и фирменная беспощадность FromSoftware, которая превращает каждую победу в событие.',
      tags: ['Soulslike', 'Открытый мир', 'Сложная', 'Тёмное фэнтези'] },

    { id: 'rdr2', app: 1174180, title: 'Red Dead Redemption 2', dev: 'Rockstar Games', pub: 'Rockstar Games', year: 2019, released: '2019-12-05',
      genres: ['Action', 'Adventure'], platforms: ['pc', 'playstation', 'xbox'], age: '18+', rating: 4.8, popularity: 93, storage: 150, tier: 'high', trailer: null,
      short: 'Эпос о закате Дикого Запада и банде Датча ван дер Линде.',
      full: 'Америка, 1899 год. Эпоха Дикого Запада заканчивается, а банда Датча пытается выжить между законом и прошлым. Артур Морган — один из самых живых героев в истории игр. Невероятная детализация мира, охота, ограбления, лагерь, в который хочется возвращаться, и сюжет, который бьёт под дых.',
      tags: ['Открытый мир', 'Вестерн', 'Сюжет', 'Реализм'] },

    { id: 'gta5', app: 271590, title: 'Grand Theft Auto V', dev: 'Rockstar North', pub: 'Rockstar Games', year: 2015, released: '2015-04-14',
      genres: ['Action', 'Adventure'], platforms: ['pc', 'playstation', 'xbox'], age: '18+', rating: 4.4, popularity: 98, storage: 110, tier: 'mid', trailer: 'QkkoHAzjnUs',
      short: 'Три героя, один Лос-Сантос и бесконечные возможности для хаоса.',
      full: 'Майкл, Франклин и Тревор — три преступника, чьи судьбы сплетаются в серии дерзких ограблений. Сатира на американскую мечту, живой город Лос-Сантос, переключение между героями прямо во время миссий — и GTA Online, который живёт своей жизнью уже больше десятилетия.',
      tags: ['Открытый мир', 'Криминал', 'Онлайн', 'Сатира'] },

    { id: 'bg3', app: 1086940, title: "Baldur's Gate 3", dev: 'Larian Studios', pub: 'Larian Studios', year: 2023, released: '2023-08-03',
      genres: ['RPG'], platforms: ['pc', 'playstation', 'xbox'], age: '18+', rating: 4.9, popularity: 89, storage: 150, tier: 'high', trailer: null,
      short: 'Партийная RPG по Dungeons & Dragons с невероятной свободой выбора.',
      full: 'Иллитидский паразит в голове — не приговор, а начало приключения. Соберите отряд, исследуйте Побережье Мечей и решайте судьбы целых народов. Правила D&D 5e, кинематографичные диалоги, кооператив и вариативность, за которую не стыдно перед классикой жанра. Новый эталон RPG.',
      tags: ['D&D', 'Пошаговая', 'Кооператив', 'Вариативность'],
      editor: 'Новый эталон жанра: свобода, за которую хочется платить сотнями часов' },

    { id: 'hogwarts', app: 990080, title: 'Hogwarts Legacy', dev: 'Avalanche Software', pub: 'Warner Bros. Games', year: 2023, released: '2023-02-10',
      genres: ['RPG', 'Adventure'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '12+', rating: 4.3, popularity: 82, storage: 85, tier: 'mid', trailer: null,
      short: 'Хогвартс XIX века: учёба, заклинания и древняя тайна магии.',
      full: 'Вы — студент пятого курса Хогвартса с редкой способностью видеть следы древней магии. Уроки зельеварения, полёты на метле, Выручай-комната, Хогсмид и Запретный лес. Мечта каждого, кто ждал письмо из школы чародейства и волшебства, — наконец сбылась.',
      tags: ['Магия', 'Открытый мир', 'Хогвартс', 'Приключение'] },

    { id: 'gow', app: 1593500, title: 'God of War', dev: 'Santa Monica Studio', pub: 'PlayStation PC', year: 2022, released: '2022-01-14',
      genres: ['Action', 'Adventure'], platforms: ['pc', 'playstation'], age: '18+', rating: 4.8, popularity: 80, storage: 70, tier: 'high', trailer: null,
      short: 'Кратос и Атрей в суровом мире скандинавских богов.',
      full: 'Отомстив олимпийцам, Кратос живёт в землях Мидгарда и учится быть отцом. Путешествие к самой высокой вершине всех миров превращается в историю о доверии, потерях и наследии. Один непрерывный кадр, топор Левиафан, который приятно держать в руках, и бои с богами.',
      tags: ['Мифология', 'Сюжет', 'Слэшер', 'Один кадр'] },

    { id: 'doom-eternal', app: 782330, title: 'DOOM Eternal', dev: 'id Software', pub: 'Bethesda Softworks', year: 2020, released: '2020-03-20',
      genres: ['Shooter'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '18+', rating: 4.6, popularity: 70, storage: 80, tier: 'mid', trailer: null,
      short: 'Скоростная мясорубка: демоны, бензопила и тяжёлый металл.',
      full: 'Землю захлестнули полчища демонов, а у Палача Рока есть дробовик с крюком и очень плохое настроение. DOOM Eternal — это шахматы на скорости 200 км/ч: бензопила ради патронов, огнемёт ради брони, добивания ради здоровья. Идеальный ритм насилия под саундтрек Мика Гордона.',
      tags: ['Арена', 'Скорость', 'Демоны', 'Метал'] },

    { id: 'cs2', app: 730, title: 'Counter-Strike 2', dev: 'Valve', pub: 'Valve', year: 2023, released: '2023-09-27',
      genres: ['Shooter'], platforms: ['pc'], age: '18+', rating: 4.0, popularity: 95, storage: 85, tier: 'mid', trailer: null,
      short: 'Легендарный тактический шутер на движке Source 2. Бесплатно.',
      full: 'Тот самый CS: дым, который реагирует на выстрелы, обновлённые карты и сабтиковую логику серверов. Террористы против спецназа, экономика раундов, эйсы и клатчи. Самая популярная соревновательная игра планеты — бесплатно и навсегда.',
      tags: ['Соревновательная', 'Тактика', 'Free to Play', 'Киберспорт'] },

    { id: 'titanfall2', app: 1237970, title: 'Titanfall 2', dev: 'Respawn Entertainment', pub: 'Electronic Arts', year: 2016, released: '2016-10-28',
      genres: ['Shooter'], platforms: ['pc', 'playstation', 'xbox'], age: '16+', rating: 4.8, popularity: 60, storage: 45, tier: 'mid', trailer: null,
      short: 'Пилот и его титан BT-7274: лучшая шутерная кампания десятилетия.',
      full: 'Стрелок Джек Купер случайно становится пилотом титана и вместе с BT-7274 пробивается через тыл врага. Бег по стенам, прыжки на двойном, уровень «Причина и следствие» с путешествиями во времени — и трогательная дружба человека с боевой машиной. Protocol 3: Protect the Pilot.',
      tags: ['Мехи', 'Паркур', 'Кампания', 'Культовая'],
      gem: 'Кампания, которую проходят за вечер и вспоминают годами' },

    { id: 'sekiro', app: 814380, title: 'Sekiro: Shadows Die Twice', dev: 'FromSoftware', pub: 'Activision', year: 2019, released: '2019-03-22',
      genres: ['Action'], platforms: ['pc', 'playstation', 'xbox'], age: '18+', rating: 4.7, popularity: 72, storage: 25, tier: 'mid', trailer: null,
      short: 'Однорукий волк против бессмертия: ритм-дуэли на катанах.',
      full: 'Япония эпохи Сэнгоку, но с мистикой и чудовищами. Волк должен вернуть похищенного господина, а помогает ему протез синоби и искусство парирования. Sekiro — это фехтование как музыкальный ритм: звон клинков, искры и красная иероглифическая подсказка. hésitation is defeat.',
      tags: ['Синоби', 'Парирование', 'Сложная', 'Япония'] },

    { id: 'ds3', app: 374320, title: 'DARK SOULS III', dev: 'FromSoftware', pub: 'Bandai Namco', year: 2016, released: '2016-04-12',
      genres: ['RPG', 'Action'], platforms: ['pc', 'playstation', 'xbox'], age: '16+', rating: 4.6, popularity: 59, storage: 25, tier: 'mid', trailer: null,
      short: 'Финал трилогии Dark Souls: угасающее пламя и величественные боссы.',
      full: 'Королевство Лотрик на краю гибели, и Негасимый должен вернуть Лордов Пепла на их троны. Самые зрелищные боссы трилогии, выверенные локации-лабиринты и то самое чувство, когда после двадцатой попытки вы наконец побеждаете. Тьма, пепел и красота.',
      tags: ['Soulslike', 'Боссы', 'Тёмное фэнтези', 'Сложная'] },

    { id: 'hollow-knight', app: 367520, title: 'Hollow Knight', dev: 'Team Cherry', pub: 'Team Cherry', year: 2017, released: '2017-02-24',
      genres: ['Indie', 'Adventure'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '6+', rating: 4.9, popularity: 73, storage: 9, tier: 'low', trailer: null,
      short: 'Мрачная метроидвания о жуке-рыцаре и павшем королевстве Халлоунест.',
      full: 'Под увядающим городом Dirtmouth спит королевство насекомых — и в его глубинах ждёт чума, история и десятки часов исследования. Отточенные бои, гениальная карта мира, меланхоличный саундтрек и боссы, требующие танца, а не заклинаний. Эталон жанра за смешные деньги.',
      tags: ['Метроидвания', 'Атмосфера', 'Боссы', 'Ручная рисовка'] },

    { id: 'hades', app: 1145360, title: 'Hades', dev: 'Supergiant Games', pub: 'Supergiant Games', year: 2020, released: '2020-09-17',
      genres: ['Indie', 'Action'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '12+', rating: 4.9, popularity: 74, storage: 15, tier: 'low', trailer: null,
      short: 'Рогалик о побеге из подземного царства, где смерть двигает сюжет.',
      full: 'Загрей, сын Аида, снова и снова штурмует выход из царства мёртвых. Каждая смерть — новые диалоги, новые дары богов Олимпа и новые комбинации оружия. Supergiant превратила поражения в удовольствие: стильная рисовка, огненный саундтрек и боги, с которыми хочется болтать.',
      tags: ['Рогалик', 'Мифология', 'Стиль', 'Сюжет'] },

    { id: 'stardew', app: 413150, title: 'Stardew Valley', dev: 'ConcernedApe', pub: 'ConcernedApe', year: 2016, released: '2016-02-26',
      genres: ['Simulation', 'Indie'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '6+', rating: 4.9, popularity: 77, storage: 1, tier: 'low', trailer: 'ot7uXNQskhs',
      short: 'Уютная ферма, шахты, рыбалка и городок, который станет домом.',
      full: 'Вы унаследовали старую ферму дедушки в долине Стардью. Грядки, коровы, сезоны, фестивали, подземелья и отношения с жителями Пеликан-тауна. Игра, сделанная одним человеком, которая лечит лучше отпуска. Осторожно: «ещё один день» превращается в три часа сна меньше.',
      tags: ['Ферма', 'Уют', 'Пиксель-арт', 'Один разработчик'] },

    { id: 'terraria', app: 105600, title: 'Terraria', dev: 'Re-Logic', pub: 'Re-Logic', year: 2011, released: '2011-05-16',
      genres: ['Indie', 'Adventure'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '12+', rating: 4.9, popularity: 67, storage: 1, tier: 'low', trailer: null,
      short: '2D-песочница: копай, строй, сражайся. Бесконечно.',
      full: 'Целый мир в разрезе: от первых деревянных стен до лунных боссов и летающих островов. Тысячи предметов, десятки боссов, классы, события и мультиплеер. Terraria — та игра, где «просто докопаю до ада» превращается в сотню часов и вторую жизнь в пикселях.',
      tags: ['Песочница', 'Крафт', 'Боссы', 'Кооператив'] },

    { id: 'forza5', app: 1551360, title: 'Forza Horizon 5', dev: 'Playground Games', pub: 'Xbox Game Studios', year: 2021, released: '2021-11-09',
      genres: ['Racing'], platforms: ['pc', 'xbox', 'playstation'], age: '6+', rating: 4.5, popularity: 84, storage: 110, tier: 'high', trailer: null,
      short: 'Гоночный фестиваль в Мексике: сотни машин и живая открытая карта.',
      full: 'Вулканы, джунгли, пустыни и колониальные города Мексики — идеальная площадка для фестиваля Horizon. Более 500 автомобилей, смена сезонов, безумные Showcase-заезды против поездов и самолётов, и аркадная физика, в которой дрифт получается у всех. Просто счастье на колёсах.',
      tags: ['Открытый мир', 'Аркада', 'Мексика', 'Тюнинг'] },

    { id: 'nfs-heat', app: 1222680, title: 'Need for Speed Heat', dev: 'Ghost Games', pub: 'Electronic Arts', year: 2019, released: '2019-11-08',
      genres: ['Racing'], platforms: ['pc', 'playstation', 'xbox'], age: '12+', rating: 4.0, popularity: 48, storage: 50, tier: 'mid', trailer: null,
      short: 'Днём — легальные гонки, ночью — нелегальные заезды и копы.',
      full: 'Палм-Сити живёт двумя жизнями: днём sanctioned-заезды приносят деньги, ночью — репутацию и проблемы с полицией. Глубокий тюнинг, неоновый вайб и погони, от которых потеют ладони. Возвращение духа Underground и Most Wanted в современной обёртке.',
      tags: ['Стритрейсинг', 'Тюнинг', 'Полиция', 'Неон'] },

    { id: 'assetto', app: 244210, title: 'Assetto Corsa', dev: 'Kunos Simulazioni', pub: 'Kunos Simulazioni', year: 2014, released: '2014-12-19',
      genres: ['Racing', 'Simulation'], platforms: ['pc', 'playstation', 'xbox'], age: '0+', rating: 4.5, popularity: 44, storage: 30, tier: 'low', trailer: null,
      short: 'Серьёзный автосимулятор с легендарной физикой и модами.',
      full: 'Лазерно-отсканированные трассы, честная физика шин и руль, который хочется купить специально ради этой игры. Сообщество превратило Assetto Corsa в бесконечный симулятор: от японских серпантинов до трафика на хайвее. Классика, которая не стареет.',
      tags: ['Симулятор', 'Физика', 'Моды', 'Руль'] },

    { id: 're4', app: 2050650, title: 'Resident Evil 4', dev: 'Capcom', pub: 'Capcom', year: 2023, released: '2023-03-24',
      genres: ['Horror', 'Action'], platforms: ['pc', 'playstation', 'xbox'], age: '18+', rating: 4.8, popularity: 78, storage: 60, tier: 'mid', trailer: null,
      short: 'Ремейк легенды: Леон, деревня, ганадос и «за плечом» камера.',
      full: 'Агент Леон Кеннеди отправляется спасать дочь президента в глухую испанскую деревню — и попадает в кошмар культа Лос Иллюминадос. Capcom бережно пересобрала классику 2005 года: современный менеджмент инвентаря, парирование ножом, торговца с его «What are ya buyin?» и идеальный темп.',
      tags: ['Ремейк', 'Survival', 'Экшен-хоррор', 'Леон'] },

    { id: 're-village', app: 1196590, title: 'Resident Evil Village', dev: 'Capcom', pub: 'Capcom', year: 2021, released: '2021-05-07',
      genres: ['Horror'], platforms: ['pc', 'playstation', 'xbox'], age: '18+', rating: 4.7, popularity: 53, storage: 45, tier: 'mid', trailer: null,
      short: 'Итан Уинтерс в снежной деревне: замок, леди Димитреску и оборотни.',
      full: 'Спустя три года после кошмара в Луизиане Итан Уинтерс ищет похищенную дочь в заснеженной европейской деревне. Четыре лорда, готический замок, фабрика и дом Беневиенто — уровень, после которого выключают свет во всей квартире. Хоррор-аттракцион высшего класса.',
      tags: ['Survival', 'Готика', 'От первого лица', 'Сюжет'] },

    { id: 'alien-isolation', app: 214490, title: 'Alien: Isolation', dev: 'Creative Assembly', pub: 'SEGA', year: 2014, released: '2014-10-07',
      genres: ['Horror'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '18+', rating: 4.6, popularity: 45, storage: 35, tier: 'low', trailer: null,
      short: 'Один ксеноморф, одна станция и детектор движения, который пищит.',
      full: 'Аманда Рипли ищет мать на станции «Севастополь» — и находит Чужого. Идеального, неубиваемого, обучающегося. Он слышит шаги, реагирует на фонарик и заглядывает в шкафчики. Эстетика фильма 1979 года, ретрофутуризм и страх, который возвращается с каждым писком детектора.',
      tags: ['Стелс', 'Чужой', 'Ретрофутуризм', 'Напряжение'] },

    { id: 'civ6', app: 289070, title: "Sid Meier's Civilization VI", dev: 'Firaxis Games', pub: '2K', year: 2016, released: '2016-10-21',
      genres: ['Strategy'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '12+', rating: 4.4, popularity: 61, storage: 12, tier: 'low', trailer: null,
      short: '«Ещё один ход» — и уже утро. Построй цивилизацию от неолита до космоса.',
      full: 'Возглавьте одну из десятков цивилизаций и проведите её через эпохи: города разрастаются по районам, чудеса света занимают клетки, а лидеры торгуются, интригуют и объявляют войны. Победы бывают научные, культурные, религиозные и военные — выбирайте свой путь к величию.',
      tags: ['4X', 'Пошаговая', 'История', 'Ещё один ход'] },

    { id: 'aoe4', app: 1466860, title: 'Age of Empires IV', dev: 'Relic Entertainment', pub: 'Xbox Game Studios', year: 2021, released: '2021-10-28',
      genres: ['Strategy'], platforms: ['pc', 'xbox'], age: '12+', rating: 4.3, popularity: 47, storage: 50, tier: 'mid', trailer: null,
      short: 'Классическая RTS вернулась: восемь цивилизаций и документальные кампании.',
      full: 'От Нормандского завоевания до Столетней войны — кампании поданы как ожившие документальные фильмы. Асимметричные цивилизации, каменные стены, на которых стоят лучники, и тот самый геймплей «база — армия — раш». Age of Empires снова в строю.',
      tags: ['RTS', 'Средневековье', 'Мультиплеер', 'Кампании'] },

    { id: 'tw-warhammer3', app: 1142710, title: 'Total War: WARHAMMER III', dev: 'Creative Assembly', pub: 'SEGA', year: 2022, released: '2022-02-17',
      genres: ['Strategy'], platforms: ['pc'], age: '16+', rating: 3.9, popularity: 42, storage: 120, tier: 'mid', trailer: null,
      short: 'Гранд-стратегия и битвы тысяч солдат в мире Warhammer Fantasy.',
      full: 'Царства Хаоса, Кислев и Великий Катай сражаются за судьбу мира на карте Immortal Empires — крупнейшей в истории серии. Пошаговая дипломатия и магия на глобальной карте, тысячи юнитов в тактических битвах. Деmons, драконы, пороховые империи — масштабу можно только позавидовать.',
      tags: ['Гранд-стратегия', 'Warhammer', 'Тактика', 'Масштаб'] },

    { id: 'cities', app: 255710, title: 'Cities: Skylines', dev: 'Colossal Order', pub: 'Paradox Interactive', year: 2015, released: '2015-03-10',
      genres: ['Simulation', 'Strategy'], platforms: ['pc', 'playstation', 'xbox'], age: '0+', rating: 4.5, popularity: 50, storage: 12, tier: 'low', trailer: null,
      short: 'Градостроительный симулятор мечты: от развязок до районов.',
      full: 'Постройте город, за который не стыдно: спроектируйте развязки, проложите метро, сбалансируйте бюджеты и не утопите районы в пробках и стоках. Глубокая симуляция агентов, огромная мастерская модов и медитативный процесс, в котором видно, как ваш город живёт.',
      tags: ['Градострой', 'Менеджмент', 'Моды', 'Песочница'] },

    { id: 'ets2', app: 227300, title: 'Euro Truck Simulator 2', dev: 'SCS Software', pub: 'SCS Software', year: 2012, released: '2012-10-19',
      genres: ['Simulation'], platforms: ['pc'], age: '0+', rating: 4.8, popularity: 52, storage: 25, tier: 'low', trailer: null,
      short: 'Дальнобой по Европе: тысячи километров спокойствия и подкастов.',
      full: 'Возьмите груз в Роттердаме и довезите его в Стамбул под дождь, закат и любимое радио. Своя логистическая компания, гаражи, наёмные водители и DLC, покрывающие почти всю Европу. Лучшая медитация на колёсах — геймеры не зря называют ETS2 терапией.',
      tags: ['Дальнобой', 'Релакс', 'Европа', 'Менеджмент'],
      gem: 'Медитация на колёсах: тысячи километров спокойствия под подкасты' },

    { id: 'fc24', app: 2195250, title: 'EA SPORTS FC 24', dev: 'EA Canada', pub: 'Electronic Arts', year: 2023, released: '2023-09-29',
      genres: ['Sports'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '0+', rating: 3.5, popularity: 40, storage: 100, tier: 'mid', trailer: null,
      short: 'Новая эра футбольного симулятора: HyperMotionV и Ultimate Team.',
      full: 'Первый сезон после развода EA и FIFA: те же лиги, звёзды и стадионы, но под новым флагом. Технология HyperMotionV, стили игры PlayStyles, кроссплей в Ultimate Team и режим карьеры. Футбол на диване с друзьями — всё ещё вне конкуренции.',
      tags: ['Футбол', 'Ultimate Team', 'Мультиплеер', 'Карьера'] },

    { id: 'rocket-league', app: 252950, title: 'Rocket League', dev: 'Psyonix', pub: 'Psyonix', year: 2015, released: '2015-07-07',
      genres: ['Sports', 'Racing'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '0+', rating: 4.4, popularity: 66, storage: 20, tier: 'low', trailer: null,
      short: 'Футбол на реактивных машинах. Просто гениально, бесконечно сложно.',
      full: 'Две команды, огромный мяч и ракетные автомобили, умеющие летать. Правила понятны за минуту, мастерство растёт годами: aerial-голы, wall-shots, flip resets. Идеальная аркада для пятиминутных матчей и тысяч часов ранкеда. What a save!',
      tags: ['Аркада', 'Киберспорт', 'Кроссплей', 'Матчи 5 минут'] },

    { id: 'dead-cells', app: 588650, title: 'Dead Cells', dev: 'Motion Twin', pub: 'Motion Twin', year: 2018, released: '2018-08-07',
      genres: ['Indie', 'Action'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '12+', rating: 4.7, popularity: 62, storage: 2, tier: 'low', trailer: null,
      short: 'Roguevania: умирай, открывай, мутируй. Быстро и залипательно.',
      full: 'Безымянный сгусток клеток вселяется в тело казнённого и снова и снова штурмует проклятый остров. Сотни видов оружия, мутации, ветвящиеся маршруты и бои, в которых скорость решает всё. Каждый забег — маленькая история, каждая смерть — новый ключ.',
      tags: ['Рогалик', 'Метроидвания', 'Пиксель-арт', 'Скорость'] },

    { id: 'celeste', app: 504230, title: 'Celeste', dev: 'Extremely OK Games', pub: 'Extremely OK Games', year: 2018, released: '2018-01-25',
      genres: ['Indie'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '6+', rating: 4.8, popularity: 55, storage: 2, tier: 'low', trailer: null,
      short: 'Платформер о восхождении на гору — и о том, как не сдаваться.',
      full: 'Мадлен поднимается на гору Селеста, сражаясь не только с шипами и ветром, но и с собственной тревогой. Тысячи экранов филигранного платформинга, мгновенные респавны и режим помощи, который никого не осуждает. История о ментальном здоровье, рассказанная геймплеем.',
      tags: ['Платформер', 'Точность', 'Саундтрек', 'История'],
      gem: 'Платформер о том, как не сдаваться — в геймплее и в жизни' },

    { id: 'disco-elysium', app: 632470, title: 'Disco Elysium', dev: 'ZA/UM', pub: 'ZA/UM', year: 2019, released: '2019-10-15',
      genres: ['RPG', 'Indie'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '18+', rating: 4.6, popularity: 54, storage: 20, tier: 'low', trailer: null,
      short: 'Детектив-РПГ, где 24 навыка спорят в голове похмельного копа.',
      full: 'Вы просыпаетесь в разгромленном номере отеля в Ревашоле, не помня ни имени, ни того, что расследуете повешенного за отелем. Внутренняя Империя, Электрохимия и Энциклопедия ведут бесконечный спор в вашей голове. Ни одного боя — и при этом самая напряжённая RPG десятилетия.',
      tags: ['Детектив', 'Диалоги', 'Политика', 'Уникальная'],
      editor: 'РПГ, где главный навык — думать. И спорить с самим собой' },

    { id: 'subnautica', app: 264710, title: 'Subnautica', dev: 'Unknown Worlds', pub: 'Unknown Worlds', year: 2018, released: '2018-01-23',
      genres: ['Adventure', 'Indie'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '12+', rating: 4.7, popularity: 58, storage: 20, tier: 'low', trailer: null,
      short: 'Выживание в океане чужой планеты: красота сверху, ужас снизу.',
      full: 'Ваш корабль упал в океан планеты 4546B. Стройте базы, сканируйте флору и фауну, спускайтесь всё глубже — туда, где кончается свет и начинаются левиафаны. История подаётся через исследование, а талассофобия выдаётся бесплатно. Одна из лучших игр о выживании.',
      tags: ['Выживание', 'Океан', 'Исследование', 'Крафт'],
      gem: 'Ужас и восторг глубины в одной океанской песочнице' },

    { id: 'wukong', app: 2358720, title: 'Black Myth: Wukong', dev: 'Game Science', pub: 'Game Science', year: 2024, released: '2024-08-20',
      genres: ['Action', 'RPG'], platforms: ['pc', 'playstation', 'xbox'], age: '16+', rating: 4.6, popularity: 88, storage: 130, tier: 'high', trailer: null,
      short: 'Избранник судьбы с посохом: экшен по «Путешествию на Запад».',
      full: 'Китайская классика оживает в облике экшен-RPG на Unreal Engine 5. Обезьяна-Избранник собирает реликвии Великого Мудреца, сражаясь с богами и демонами из романа «Путешествие на Запад». Превращения, заклинания застывания, посох и боссы, снящиеся неделями.',
      tags: ['Мифология Китая', 'Боссы', 'UE5', 'Экшен-RPG'] },

    { id: 'helldivers2', app: 553850, title: 'HELLDIVERS 2', dev: 'Arrowhead Game Studios', pub: 'PlayStation PC', year: 2024, released: '2024-02-08',
      genres: ['Shooter'], platforms: ['pc', 'playstation'], age: '18+', rating: 4.2, popularity: 85, storage: 100, tier: 'mid', trailer: null,
      short: 'Кооперативный шутер: неси демократию жукам и роботам. За Супер-Землю!',
      full: 'Отряды из четырёх адских десантников высаживаются на враждебные планеты, чтобы нести управляемую демократию терми-нидам и автоматонам. Стратегемы, дружественный огонь, крики «REINFORCING!» и сатира на суперпатриотизм. Лучший кооп-хаос со времён Left 4 Dead.',
      tags: ['Кооператив', 'Сатира', 'Хаос', 'Стратегемы'] },

    { id: 'it-takes-two', app: 1426210, title: 'It Takes Two', dev: 'Hazelight Studios', pub: 'Electronic Arts', year: 2021, released: '2021-03-26',
      genres: ['Adventure'], platforms: ['pc', 'playstation', 'xbox', 'switch'], age: '12+', rating: 4.9, popularity: 51, storage: 50, tier: 'mid', trailer: null,
      short: 'Кооперативное приключение пары на грани развода. Только вдвоём.',
      full: 'Коди и Мэй превращены в кукол и должны пройти через сад, часы, снежный шар и собственную обиду, чтобы вернуться в свои тела. Каждый уровень — новая механика, каждый пазл требует двоих. Friend’s Pass позволяет играть вдвоём с одной копии. Игра года — заслуженно.',
      tags: ['Кооператив', 'Сплит-скрин', 'Пазлы', 'Игра года'],
      editor: 'Лучший кооператив десятилетия: не отпускает ни на минуту' },

    { id: 'starfield', app: 1716740, title: 'Starfield', dev: 'Bethesda Game Studios', pub: 'Bethesda Softworks', year: 2023, released: '2023-09-06',
      genres: ['RPG'], platforms: ['pc', 'xbox'], age: '18+', rating: 3.7, popularity: 68, storage: 125, tier: 'high', trailer: null,
      short: 'Космическая RPG Bethesda: тысяча планет и вечный вопрос «что там?».',
      full: 'Первая новая вселенная Bethesda за 25 лет. Вступите в Constellation — последних исследователей космоса — и ищите артефакты, меняющие представление о мироздании. Строительство кораблей, аутпосты, фракционные квесты и фирменное «ещё одна планета» до рассвета.',
      tags: ['Космос', 'Открытый мир', 'Корабли', 'Исследование'] }
  ];

  /* Ориентировочные системные требования по классам (демо) */
  var SPEC_TIERS = {
    low: {
      min: { cpu: 'Intel Core i3-4130 / AMD FX-4300', ram: '4 ГБ ОЗУ', gpu: 'GeForce GT 730 / Radeon R7 240', dx: 'DirectX 11' },
      rec: { cpu: 'Intel Core i5-6500 / Ryzen 3 1200', ram: '8 ГБ ОЗУ', gpu: 'GeForce GTX 1050 / RX 560', dx: 'DirectX 11' }
    },
    mid: {
      min: { cpu: 'Intel Core i5-6600 / Ryzen 5 1600', ram: '8 ГБ ОЗУ', gpu: 'GeForce GTX 1060 6GB / RX 580', dx: 'DirectX 12' },
      rec: { cpu: 'Intel Core i7-8700 / Ryzen 5 3600', ram: '16 ГБ ОЗУ', gpu: 'GeForce RTX 2060 / RX 5700 XT', dx: 'DirectX 12' }
    },
    high: {
      min: { cpu: 'Intel Core i7-9700 / Ryzen 7 3700X', ram: '16 ГБ ОЗУ', gpu: 'GeForce RTX 2060 / RX 6600 XT', dx: 'DirectX 12' },
      rec: { cpu: 'Intel Core i9-12900 / Ryzen 9 5900X', ram: '32 ГБ ОЗУ', gpu: 'GeForce RTX 4070 / RX 7800 XT', dx: 'DirectX 12 Ultimate' }
    }
  };

  var STATUSES = [
    { id: 'want',    label: 'Хочу сыграть', color: '#38BDF8', icon: 'clock' },
    { id: 'playing', label: 'Играю',        color: '#FBBF24', icon: 'play' },
    { id: 'done',    label: 'Пройдено',     color: '#34D399', icon: 'checkCircle' },
    { id: 'dropped', label: 'Отложено',     color: '#FB7185', icon: 'pause' }
  ];

  var THEMES = [
    { id: 'violet', label: 'Фиолетовая', c1: '#8B5CF6', c2: '#38BDF8' },
    { id: 'blue',   label: 'Синяя',      c1: '#3B82F6', c2: '#22D3EE' },
    { id: 'teal',   label: 'Бирюзовая',  c1: '#2DD4BF', c2: '#38BDF8' }
  ];

  var HERO_FEATURES = ['wukong', 'cyberpunk-2077', 'elden-ring'];
  var EDITOR_PICKS = ['bg3', 'disco-elysium', 'it-takes-two'];
  var GEMS = ['titanfall2', 'celeste', 'ets2', 'subnautica'];

  global.GHData = {
    games: games,
    GENRES: GENRES,
    PLATFORMS: PLATFORMS,
    STATUSES: STATUSES,
    THEMES: THEMES,
    SPEC_TIERS: SPEC_TIERS,
    HERO_FEATURES: HERO_FEATURES,
    EDITOR_PICKS: EDITOR_PICKS,
    GEMS: GEMS
  };
})(window);