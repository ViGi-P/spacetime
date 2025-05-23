/* spencermountain/spacetime 7.10.0 Apache 2.0 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.spacetime = factory());
})(this, (function () { 'use strict';

  const MSEC_IN_HOUR = 60 * 60 * 1000;

  //convert our local date syntax a javascript UTC date
  const toUtc = (dstChange, offset, year) => {
    const [month, rest] = dstChange.split('/');
    const [day, hour] = rest.split(':');
    return Date.UTC(year, month - 1, day, hour) - (offset * MSEC_IN_HOUR)
  };

  // compare epoch with dst change events (in utc)
  const inSummerTime = (epoch, start, end, summerOffset, winterOffset) => {
    const year = new Date(epoch).getUTCFullYear();
    const startUtc = toUtc(start, winterOffset, year);
    const endUtc = toUtc(end, summerOffset, year);
    // simple number comparison now
    return epoch >= startUtc && epoch < endUtc
  };

  /* eslint-disable no-console */

  // this method avoids having to do a full dst-calculation on every operation
  // it reproduces some things in ./index.js, but speeds up spacetime considerably
  const quickOffset = s => {
    let zones = s.timezones;
    let obj = zones[s.tz];
    if (obj === undefined) {
      console.warn("Warning: couldn't find timezone " + s.tz);
      return 0
    }
    if (obj.dst === undefined) {
      return obj.offset
    }

    //get our two possible offsets
    let jul = obj.offset;
    let dec = obj.offset + 1; // assume it's the same for now
    if (obj.hem === 'n') {
      dec = jul - 1;
    }
    let split = obj.dst.split('->');
    let inSummer = inSummerTime(s.epoch, split[0], split[1], jul, dec);
    if (inSummer === true) {
      return jul
    }
    return dec
  };

  var data = {
    "9|s": "2/dili,2/jayapura",
    "9|n": "2/chita,2/khandyga,2/pyongyang,2/seoul,2/tokyo,2/yakutsk,11/palau,japan,rok",
    "9.5|s|04/06:03->10/05:02": "4/adelaide,4/broken_hill,4/south,4/yancowinna",
    "9.5|s": "4/darwin,4/north",
    "8|s|03/13:01->10/02:00": "12/casey",
    "8|s": "2/kuala_lumpur,2/makassar,2/singapore,4/perth,2/ujung_pandang,4/west,singapore",
    "8|n": "2/brunei,2/hong_kong,2/irkutsk,2/kuching,2/macau,2/manila,2/shanghai,2/taipei,2/ulaanbaatar,2/chongqing,2/chungking,2/harbin,2/macao,2/ulan_bator,2/choibalsan,hongkong,prc,roc",
    "8.75|s": "4/eucla",
    "7|s": "12/davis,2/jakarta,9/christmas",
    "7|n": "2/bangkok,2/barnaul,2/hovd,2/krasnoyarsk,2/novokuznetsk,2/novosibirsk,2/phnom_penh,2/pontianak,2/ho_chi_minh,2/tomsk,2/vientiane,2/saigon",
    "6|s": "12/vostok",
    "6|n": "2/almaty,2/bishkek,2/dhaka,2/omsk,2/qyzylorda,2/qostanay,2/thimphu,2/urumqi,9/chagos,2/dacca,2/kashgar,2/thimbu",
    "6.5|n": "2/yangon,9/cocos,2/rangoon",
    "5|s": "12/mawson,9/kerguelen",
    "5|n": "2/aqtau,2/aqtobe,2/ashgabat,2/atyrau,2/dushanbe,2/karachi,2/oral,2/samarkand,2/tashkent,2/yekaterinburg,9/maldives,2/ashkhabad",
    "5.75|n": "2/kathmandu,2/katmandu",
    "5.5|n": "2/kolkata,2/colombo,2/calcutta",
    "4|s": "9/reunion",
    "4|n": "2/baku,2/dubai,2/muscat,2/tbilisi,2/yerevan,8/astrakhan,8/samara,8/saratov,8/ulyanovsk,8/volgograd,9/mahe,9/mauritius,2/volgograd",
    "4.5|n": "2/kabul",
    "3|s": "12/syowa,9/antananarivo",
    "3|n|04/25:00->10/30:24": "0/cairo,egypt",
    "3|n|04/12:02->10/25:02": "2/gaza,2/hebron",
    "3|n|03/30:03->10/26:04": "2/famagusta,2/nicosia,8/athens,8/bucharest,8/helsinki,8/kyiv,8/mariehamn,8/riga,8/sofia,8/tallinn,8/uzhgorod,8/vilnius,8/zaporozhye,8/nicosia,8/kiev,eet",
    "3|n|03/30:02->10/26:03": "8/chisinau,8/tiraspol",
    "3|n|03/30:00->10/25:24": "2/beirut",
    "3|n|03/28:02->10/26:02": "2/jerusalem,2/tel_aviv,israel",
    "3|n": "0/addis_ababa,0/asmara,0/asmera,0/dar_es_salaam,0/djibouti,0/juba,0/kampala,0/mogadishu,0/nairobi,2/aden,2/amman,2/baghdad,2/bahrain,2/damascus,2/kuwait,2/qatar,2/riyadh,8/istanbul,8/kirov,8/minsk,8/moscow,8/simferopol,9/comoro,9/mayotte,2/istanbul,turkey,w-su",
    "3.5|n": "2/tehran,iran",
    "2|s|03/30:02->10/26:02": "12/troll",
    "2|s": "0/gaborone,0/harare,0/johannesburg,0/lubumbashi,0/lusaka,0/maputo,0/maseru,0/mbabane",
    "2|n|03/30:02->10/26:03": "0/ceuta,arctic/longyearbyen,8/amsterdam,8/andorra,8/belgrade,8/berlin,8/bratislava,8/brussels,8/budapest,8/busingen,8/copenhagen,8/gibraltar,8/ljubljana,8/luxembourg,8/madrid,8/malta,8/monaco,8/oslo,8/paris,8/podgorica,8/prague,8/rome,8/san_marino,8/sarajevo,8/skopje,8/stockholm,8/tirane,8/vaduz,8/vatican,8/vienna,8/warsaw,8/zagreb,8/zurich,3/jan_mayen,poland,cet,met",
    "2|n": "0/blantyre,0/bujumbura,0/khartoum,0/kigali,0/tripoli,8/kaliningrad,libya",
    "1|s": "0/brazzaville,0/kinshasa,0/luanda,0/windhoek",
    "1|n|03/30:01->10/26:02": "3/canary,3/faroe,3/madeira,8/dublin,8/guernsey,8/isle_of_man,8/jersey,8/lisbon,8/london,3/faeroe,eire,8/belfast,gb-eire,gb,portugal,wet",
    "1|n": "0/algiers,0/bangui,0/douala,0/lagos,0/libreville,0/malabo,0/ndjamena,0/niamey,0/porto-novo,0/tunis",
    "14|n": "11/kiritimati",
    "13|s": "11/apia,11/tongatapu",
    "13|n": "11/enderbury,11/kanton,11/fakaofo",
    "12|s|04/06:03->09/28:02": "12/mcmurdo,11/auckland,12/south_pole,nz",
    "12|s": "11/fiji",
    "12|n": "2/anadyr,2/kamchatka,2/srednekolymsk,11/funafuti,11/kwajalein,11/majuro,11/nauru,11/tarawa,11/wake,11/wallis,kwajalein",
    "12.75|s|04/06:03->04/06:02": "11/chatham,nz-chat",
    "11|s|04/06:03->10/05:02": "12/macquarie",
    "11|s": "11/bougainville",
    "11|n": "2/magadan,2/sakhalin,11/efate,11/guadalcanal,11/kosrae,11/noumea,11/pohnpei,11/ponape",
    "11.5|n|04/06:03->10/05:02": "11/norfolk",
    "10|s|04/06:03->10/05:02": "4/currie,4/hobart,4/melbourne,4/sydney,4/act,4/canberra,4/nsw,4/tasmania,4/victoria",
    "10|s": "12/dumontdurville,4/brisbane,4/lindeman,11/port_moresby,4/queensland",
    "10|n": "2/ust-nera,2/vladivostok,11/guam,11/saipan,11/chuuk,11/truk,11/yap",
    "10.5|s|04/06:01->10/05:02": "4/lord_howe,4/lhi",
    "0|s|02/23:03->04/06:02": "0/casablanca,0/el_aaiun",
    "0|n|03/30:00->10/26:01": "3/azores",
    "0|n|03/29:11->10/25:24": "1/scoresbysund",
    "0|n": "0/abidjan,0/accra,0/bamako,0/banjul,0/bissau,0/conakry,0/dakar,0/freetown,0/lome,0/monrovia,0/nouakchott,0/ouagadougou,0/sao_tome,1/danmarkshavn,3/reykjavik,3/st_helena,13/gmt,13/utc,0/timbuktu,13/greenwich,13/uct,13/universal,13/zulu,gmt-0,gmt+0,gmt0,greenwich,iceland,uct,universal,utc,zulu,13/unknown,factory",
    "-9|n|03/09:02->11/02:02": "1/adak,1/atka,us/aleutian",
    "-9|n": "11/gambier",
    "-9.5|n": "11/marquesas",
    "-8|n|03/09:02->11/02:02": "1/anchorage,1/juneau,1/metlakatla,1/nome,1/sitka,1/yakutat,us/alaska",
    "-8|n": "11/pitcairn",
    "-7|n|03/09:02->11/02:02": "1/los_angeles,1/santa_isabel,1/tijuana,1/vancouver,1/ensenada,6/pacific,10/bajanorte,us/pacific-new,us/pacific",
    "-7|n": "1/creston,1/dawson,1/dawson_creek,1/fort_nelson,1/hermosillo,1/mazatlan,1/phoenix,1/whitehorse,6/yukon,10/bajasur,us/arizona,mst",
    "-6|s|04/05:22->09/06:22": "11/easter,7/easterisland",
    "-6|n|04/07:02->10/27:02": "1/merida",
    "-6|n|03/09:02->11/02:02": "1/boise,1/cambridge_bay,1/denver,1/edmonton,1/inuvik,1/north_dakota,1/ojinaga,1/ciudad_juarez,1/yellowknife,1/shiprock,6/mountain,navajo,us/mountain",
    "-6|n": "1/bahia_banderas,1/belize,1/chihuahua,1/costa_rica,1/el_salvador,1/guatemala,1/managua,1/mexico_city,1/monterrey,1/regina,1/swift_current,1/tegucigalpa,11/galapagos,6/east-saskatchewan,6/saskatchewan,10/general",
    "-5|s": "1/lima,1/rio_branco,1/porto_acre,5/acre",
    "-5|n|03/09:02->11/02:02": "1/chicago,1/matamoros,1/menominee,1/rainy_river,1/rankin_inlet,1/resolute,1/winnipeg,1/indiana/knox,1/indiana/tell_city,1/north_dakota/beulah,1/north_dakota/center,1/north_dakota/new_salem,1/knox_in,6/central,us/central,us/indiana-starke",
    "-5|n": "1/bogota,1/cancun,1/cayman,1/coral_harbour,1/eirunepe,1/guayaquil,1/jamaica,1/panama,1/atikokan,jamaica,est",
    "-4|s|04/05:24->09/07:00": "1/santiago,7/continental",
    "-4|s|03/22:24->10/05:00": "1/asuncion",
    "-4|s": "1/campo_grande,1/cuiaba,1/la_paz,1/manaus,5/west",
    "-4|n|03/09:02->11/02:02": "1/detroit,1/grand_turk,1/indiana,1/indianapolis,1/iqaluit,1/kentucky,1/louisville,1/montreal,1/nassau,1/new_york,1/nipigon,1/pangnirtung,1/port-au-prince,1/thunder_bay,1/toronto,1/indiana/marengo,1/indiana/petersburg,1/indiana/vevay,1/indiana/vincennes,1/indiana/winamac,1/kentucky/monticello,1/fort_wayne,1/indiana/indianapolis,1/kentucky/louisville,6/eastern,us/east-indiana,us/eastern,us/michigan",
    "-4|n|03/09:00->11/02:01": "1/havana,cuba",
    "-4|n": "1/anguilla,1/antigua,1/aruba,1/barbados,1/blanc-sablon,1/boa_vista,1/caracas,1/curacao,1/dominica,1/grenada,1/guadeloupe,1/guyana,1/kralendijk,1/lower_princes,1/marigot,1/martinique,1/montserrat,1/port_of_spain,1/porto_velho,1/puerto_rico,1/santo_domingo,1/st_barthelemy,1/st_kitts,1/st_lucia,1/st_thomas,1/st_vincent,1/tortola,1/virgin",
    "-3|s": "1/argentina,1/buenos_aires,1/catamarca,1/cordoba,1/fortaleza,1/jujuy,1/mendoza,1/montevideo,1/punta_arenas,1/sao_paulo,12/palmer,12/rothera,3/stanley,1/argentina/la_rioja,1/argentina/rio_gallegos,1/argentina/salta,1/argentina/san_juan,1/argentina/san_luis,1/argentina/tucuman,1/argentina/ushuaia,1/argentina/comodrivadavia,1/argentina/buenos_aires,1/argentina/catamarca,1/argentina/cordoba,1/argentina/jujuy,1/argentina/mendoza,1/argentina/rosario,1/rosario,5/east",
    "-3|n|03/09:02->11/02:02": "1/glace_bay,1/goose_bay,1/halifax,1/moncton,1/thule,3/bermuda,6/atlantic",
    "-3|n": "1/araguaina,1/bahia,1/belem,1/cayenne,1/maceio,1/paramaribo,1/recife,1/santarem",
    "-2|n|03/09:02->11/02:02": "1/miquelon",
    "-2|n": "1/noronha,3/south_georgia,5/denoronha",
    "-2.5|n|03/09:02->11/02:02": "1/st_johns,6/newfoundland",
    "-1|n|03/29:11->10/25:24": "1/nuuk,1/godthab",
    "-1|n": "3/cape_verde",
    "-11|n": "11/midway,11/niue,11/pago_pago,11/samoa,us/samoa",
    "-10|n": "11/honolulu,11/johnston,11/rarotonga,11/tahiti,us/hawaii,hst"
  };

  //prefixes for iana names..
  var prefixes = [
    'africa',
    'america',
    'asia',
    'atlantic',
    'australia',
    'brazil',
    'canada',
    'chile',
    'europe',
    'indian',
    'mexico',
    'pacific',
    'antarctica',
    'etc'
  ];

  let all = {};
  Object.keys(data).forEach((k) => {
    let split = k.split('|');
    let obj = {
      offset: Number(split[0]),
      hem: split[1]
    };
    if (split[2]) {
      obj.dst = split[2];
    }
    let names = data[k].split(',');
    names.forEach((str) => {
      str = str.replace(/(^[0-9]+)\//, (before, num) => {
        num = Number(num);
        return prefixes[num] + '/'
      });
      all[str] = obj;
    });
  });

  all.utc = {
    offset: 0,
    hem: 'n' //default to northern hemisphere - (sorry!)
  };

  //add etc/gmt+n
  for (let i = -14; i <= 14; i += 0.5) {
    let num = i;
    if (num > 0) {
      num = '+' + num;
    }
    let name = 'etc/gmt' + num;
    all[name] = {
      offset: i * -1, //they're negative!
      hem: 'n' //(sorry)
    };
    name = 'utc/gmt' + num; //this one too, why not.
    all[name] = {
      offset: i * -1,
      hem: 'n'
    };
  }

  //find the implicit iana code for this machine.
  //safely query the Intl object
  //based on - https://bitbucket.org/pellepim/jstimezonedetect/src
  const fallbackTZ = 'utc'; //

  //this Intl object is not supported often, yet
  const safeIntl = () => {
    if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat === 'undefined') {
      return null
    }
    let format = Intl.DateTimeFormat();
    if (typeof format === 'undefined' || typeof format.resolvedOptions === 'undefined') {
      return null
    }
    let timezone = format.resolvedOptions().timeZone;
    if (!timezone) {
      return null
    }
    return timezone.toLowerCase()
  };

  const guessTz = () => {
    let timezone = safeIntl();
    if (timezone === null) {
      return fallbackTZ
    }
    return timezone
  };

  const isOffset = /(-?[0-9]+)h(rs)?/i;
  const isNumber = /(-?[0-9]+)/;
  const utcOffset = /utc([\-+]?[0-9]+)/i;
  const gmtOffset = /gmt([\-+]?[0-9]+)/i;

  const toIana = function (num) {
    num = Number(num);
    if (num >= -13 && num <= 13) {
      num = num * -1; //it's opposite!
      num = (num > 0 ? '+' : '') + num; //add plus sign
      return 'etc/gmt' + num
    }
    return null
  };

  const parseOffset$1 = function (tz) {
    // '+5hrs'
    let m = tz.match(isOffset);
    if (m !== null) {
      return toIana(m[1])
    }
    // 'utc+5'
    m = tz.match(utcOffset);
    if (m !== null) {
      return toIana(m[1])
    }
    // 'GMT-5' (not opposite)
    m = tz.match(gmtOffset);
    if (m !== null) {
      let num = Number(m[1]) * -1;
      return toIana(num)
    }
    // '+5'
    m = tz.match(isNumber);
    if (m !== null) {
      return toIana(m[1])
    }
    return null
  };

  /* eslint-disable no-console */


  let local = guessTz();

  //add all the city names by themselves
  const cities = Object.keys(all).reduce((h, k) => {
    let city = k.split('/')[1] || '';
    city = city.replace(/_/g, ' ');
    h[city] = k;
    return h
  }, {});

  //try to match these against iana form
  const normalize$2 = (tz) => {
    tz = tz.replace(/ time/g, '');
    tz = tz.replace(/ (standard|daylight|summer)/g, '');
    tz = tz.replace(/\b(east|west|north|south)ern/g, '$1');
    tz = tz.replace(/\b(africa|america|australia)n/g, '$1');
    tz = tz.replace(/\beuropean/g, 'europe');
    tz = tz.replace(/islands/g, 'island');
    return tz
  };

  // try our best to reconcile the timzone to this given string
  const lookupTz = (str, zones) => {
    if (!str) {
      // guard if Intl response is unsupported (#397)
      if (!zones.hasOwnProperty(local)) {
        console.warn(`Unrecognized IANA id '${local}'. Setting fallback tz to UTC.`);
        local = 'utc';
      }
      return local
    }
    if (typeof str !== 'string') {
      console.error("Timezone must be a string - recieved: '", str, "'\n");
    }
    let tz = str.trim();
    // let split = str.split('/')
    //support long timezones like 'America/Argentina/Rio_Gallegos'
    // if (split.length > 2 && zones.hasOwnProperty(tz) === false) {
    //   tz = split[0] + '/' + split[1]
    // }
    tz = tz.toLowerCase();
    if (zones.hasOwnProperty(tz) === true) {
      return tz
    }
    //lookup more loosely..
    tz = normalize$2(tz);
    if (zones.hasOwnProperty(tz) === true) {
      return tz
    }
    //try city-names
    if (cities.hasOwnProperty(tz) === true) {
      return cities[tz]
    }
    // //try to parse '-5h'
    if (/[0-9]/.test(tz) === true) {
      let id = parseOffset$1(tz);
      if (id) {
        return id
      }
    }

    throw new Error(
      "Spacetime: Cannot find timezone named: '" + str + "'. Please enter an IANA timezone id."
    )
  };

  //git:blame @JuliasCaesar https://www.timeanddate.com/date/leapyear.html
  function isLeapYear(year) { return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 }
  // unsurprisingly-nasty `typeof date` call
  function isDate(d) { return Object.prototype.toString.call(d) === '[object Date]' && !isNaN(d.valueOf()) }
  function isArray(input) { return Object.prototype.toString.call(input) === '[object Array]' }
  function isObject(input) { return Object.prototype.toString.call(input) === '[object Object]' }
  function isBoolean(input) { return Object.prototype.toString.call(input) === '[object Boolean]' }

  function zeroPad(str, len = 2) {
    let pad = '0';
    str = str + '';
    return str.length >= len ? str : new Array(len - str.length + 1).join(pad) + str
  }

  function titleCase$1(str) {
    if (!str) {
      return ''
    }
    return str[0].toUpperCase() + str.substr(1)
  }

  function ordinal(i) {
    let j = i % 10;
    let k = i % 100;
    if (j === 1 && k !== 11) {
      return i + 'st'
    }
    if (j === 2 && k !== 12) {
      return i + 'nd'
    }
    if (j === 3 && k !== 13) {
      return i + 'rd'
    }
    return i + 'th'
  }

  //strip 'st' off '1st'..
  function toCardinal(str) {
    str = String(str);
    str = str.replace(/([0-9])(st|nd|rd|th)$/i, '$1');
    return parseInt(str, 10)
  }

  //used mostly for cleanup of unit names, like 'months'
  function normalize$1(str = '') {
    str = str.toLowerCase().trim();
    str = str.replace(/ies$/, 'y'); //'centuries'
    str = str.replace(/s$/, '');
    str = str.replace(/-/g, '');
    if (str === 'day' || str === 'days') {
      return 'date'
    }
    if (str === 'min' || str === 'mins') {
      return 'minute'
    }
    return str
  }

  function getEpoch(tmp) {
    //support epoch
    if (typeof tmp === 'number') {
      return tmp
    }
    //suport date objects
    if (isDate(tmp)) {
      return tmp.getTime()
    }
    // support spacetime objects
    if (tmp.epoch || tmp.epoch === 0) {
      return tmp.epoch
    }
    return null
  }

  //make sure this input is a spacetime obj
  function beADate(d, s) {
    if (isObject(d) === false) {
      return s.clone().set(d)
    }
    return d
  }

  function formatTimezone(offset, delimiter = '') {
    const sign = offset > 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const hours = zeroPad(parseInt('' + absOffset, 10));
    const minutes = zeroPad((absOffset % 1) * 60);
    return `${sign}${hours}${delimiter}${minutes}`
  }

  /* eslint-disable no-console */
  const defaults$1 = {
    year: new Date().getFullYear(),
    month: 0,
    date: 1
  };
  const units$5 = ['year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond'];

  //support [2016, 03, 01] format
  const parseArray$1 = (s, arr, today) => {
    if (arr.length === 0) {
      return s
    }
    for (let i = 0; i < units$5.length; i++) {
      let num = arr[i] || today[units$5[i]] || defaults$1[units$5[i]] || 0;
      s = s[units$5[i]](num);
    }
    return s
  };

  //support {year:2016, month:3} format
  const parseObject$1 = (s, obj) => {
    if (Object.keys(obj).length === 0) {
      return s
    }
    obj = Object.assign({}, defaults$1, obj);
    if (obj.timezone) {
      s.tz = obj.timezone;
    }
    for (let i = 0; i < units$5.length; i++) {
      let unit = units$5[i];
      if (obj[unit] !== undefined) {
        s = s[unit](obj[unit]);
      }
    }
    return s
  };

  // this may seem like an arbitrary number, but it's 'within jan 1970'
  // this is only really ambiguous until 2054 or so
  const parseNumber$1 = function (s, input) {
    const minimumEpoch = 2500000000;
    // if the given epoch is really small, they've probably given seconds and not milliseconds
    // anything below this number is likely (but not necessarily) a mistaken input.
    if (input > 0 && input < minimumEpoch && s.silent === false) {
      console.warn('  - Warning: You are setting the date to January 1970.');
      console.warn('       -   did input seconds instead of milliseconds?');
    }
    s.epoch = input;
    return s
  };

  var fns = {
    parseArray: parseArray$1,
    parseObject: parseObject$1,
    parseNumber: parseNumber$1
  };

  // pull in 'today' data for the baseline moment
  const getNow = function (s) {
    s.epoch = Date.now();
    Object.keys(s._today || {}).forEach((k) => {
      if (typeof s[k] === 'function') {
        s = s[k](s._today[k]);
      }
    });
    return s
  };

  const dates = {
    now: (s) => {
      return getNow(s)
    },
    today: (s) => {
      return getNow(s)
    },
    tonight: (s) => {
      s = getNow(s);
      s = s.hour(18); //6pm
      return s
    },
    tomorrow: (s) => {
      s = getNow(s);
      s = s.add(1, 'day');
      s = s.startOf('day');
      return s
    },
    yesterday: (s) => {
      s = getNow(s);
      s = s.subtract(1, 'day');
      s = s.startOf('day');
      return s
    },
    christmas: (s) => {
      let year = getNow(s).year();
      s = s.set([year, 11, 25, 18, 0, 0]); // Dec 25
      return s
    },
    'new years': (s) => {
      let year = getNow(s).year();
      s = s.set([year, 11, 31, 18, 0, 0]); // Dec 31
      return s
    }
  };
  dates['new years eve'] = dates['new years'];

  //little cleanup..
  const normalize = function (str) {
    // remove all day-names
    str = str.replace(/\b(mon|tues?|wed|wednes|thur?s?|fri|sat|satur|sun)(day)?\b/i, '');
    //remove ordinal ending
    str = str.replace(/([0-9])(th|rd|st|nd)/, '$1');
    str = str.replace(/,/g, '');
    str = str.replace(/ +/g, ' ').trim();
    return str
  };

  let o = {
    millisecond: 1
  };
  o.second = 1000;
  o.minute = 60000;
  o.hour = 3.6e6; // dst is supported post-hoc
  o.day = 8.64e7; //
  o.date = o.day;
  o.month = 8.64e7 * 29.5; //(average)
  o.week = 6.048e8;
  o.year = 3.154e10; // leap-years are supported post-hoc
  //add plurals
  Object.keys(o).forEach(k => {
    o[k + 's'] = o[k];
  });

  /* eslint-disable no-console */

  //basically, step-forward/backward until js Date object says we're there.
  const walk = (s, n, fn, unit, previous) => {
    let current = s.d[fn]();
    if (current === n) {
      return //already there
    }
    let startUnit = previous === null ? null : s.d[previous]();
    let original = s.epoch;
    //try to get it as close as we can
    let diff = n - current;
    s.epoch += o[unit] * diff;
    //DST edge-case: if we are going many days, be a little conservative
    // console.log(unit, diff)
    if (unit === 'day') {
      // s.epoch -= ms.minute
      //but don't push it over a month
      if (Math.abs(diff) > 28 && n < 28) {
        s.epoch += o.hour;
      }
    }
    // 1st time: oops, did we change previous unit? revert it.
    if (previous !== null && startUnit !== s.d[previous]()) {
      // console.warn('spacetime warning: missed setting ' + unit)
      s.epoch = original;
      // s.epoch += ms[unit] * diff * 0.89 // maybe try and make it close...?
    }
    //repair it if we've gone too far or something
    //(go by half-steps, just in case)
    const halfStep = o[unit] / 2;
    while (s.d[fn]() < n) {
      s.epoch += halfStep;
    }

    while (s.d[fn]() > n) {
      s.epoch -= halfStep;
    }
    // 2nd time: did we change previous unit? revert it.
    if (previous !== null && startUnit !== s.d[previous]()) {
      // console.warn('spacetime warning: missed setting ' + unit)
      s.epoch = original;
    }
  };
  //find the desired date by a increment/check while loop
  const units$4 = {
    year: {
      valid: (n) => n > -4e3 && n < 4000,
      walkTo: (s, n) => walk(s, n, 'getFullYear', 'year', null)
    },
    month: {
      valid: (n) => n >= 0 && n <= 11,
      walkTo: (s, n) => {
        let d = s.d;
        let current = d.getMonth();
        let original = s.epoch;
        let startUnit = d.getFullYear();
        if (current === n) {
          return
        }
        //try to get it as close as we can..
        let diff = n - current;
        s.epoch += o.day * (diff * 28); //special case
        //oops, did we change the year? revert it.
        if (startUnit !== s.d.getFullYear()) {
          s.epoch = original;
        }
        //increment by day
        while (s.d.getMonth() < n) {
          s.epoch += o.day;
        }
        while (s.d.getMonth() > n) {
          s.epoch -= o.day;
        }
      }
    },
    date: {
      valid: (n) => n > 0 && n <= 31,
      walkTo: (s, n) => walk(s, n, 'getDate', 'day', 'getMonth')
    },
    hour: {
      valid: (n) => n >= 0 && n < 24,
      walkTo: (s, n) => walk(s, n, 'getHours', 'hour', 'getDate')
    },
    minute: {
      valid: (n) => n >= 0 && n < 60,
      walkTo: (s, n) => walk(s, n, 'getMinutes', 'minute', 'getHours')
    },
    second: {
      valid: (n) => n >= 0 && n < 60,
      walkTo: (s, n) => {
        //do this one directly
        s.epoch = s.seconds(n).epoch;
      }
    },
    millisecond: {
      valid: (n) => n >= 0 && n < 1000,
      walkTo: (s, n) => {
        //do this one directly
        s.epoch = s.milliseconds(n).epoch;
      }
    }
  };

  const walkTo = (s, wants) => {
    let keys = Object.keys(units$4);
    let old = s.clone();
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      let n = wants[k];
      if (n === undefined) {
        n = old[k]();
      }
      if (typeof n === 'string') {
        n = parseInt(n, 10);
      }
      //make-sure it's valid
      if (!units$4[k].valid(n)) {
        s.epoch = null;
        if (s.silent === false) {
          console.warn('invalid ' + k + ': ' + n);
        }
        return
      }
      units$4[k].walkTo(s, n);
    }
    return
  };

  const monthLengths = [
    31, // January - 31 days
    28, // February - 28 days in a common year and 29 days in leap years
    31, // March - 31 days
    30, // April - 30 days
    31, // May - 31 days
    30, // June - 30 days
    31, // July - 31 days
    31, // August - 31 days
    30, // September - 30 days
    31, // October - 31 days
    30, // November - 30 days
    31 // December - 31 days
  ];

  // 28 - feb
  // 30 - april, june, sept, nov
  // 31 - jan, march, may, july, aug, oct, dec

  let shortMonths = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec'
  ];
  let longMonths = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ];

  function buildMapping() {
    const obj = {
      sep: 8 //support this format
    };
    for (let i = 0; i < shortMonths.length; i++) {
      obj[shortMonths[i]] = i;
    }
    for (let i = 0; i < longMonths.length; i++) {
      obj[longMonths[i]] = i;
    }
    return obj
  }

  function short$1() { return shortMonths }
  function long$1() { return longMonths }
  function mapping$1() { return buildMapping() }
  function set$5(i18n) {
    shortMonths = i18n.short || shortMonths;
    longMonths = i18n.long || longMonths;
  }

  //pull-apart ISO offsets, like "+0100"
  const parseOffset = (s, offset) => {
    if (!offset) {
      return s
    }
    offset = offset.trim().toLowerCase();
    // according to ISO8601, tz could be hh:mm, hhmm or hh
    // so need few more steps before the calculation.
    let num = 0;

    // for (+-)hh:mm
    if (/^[+-]?[0-9]{2}:[0-9]{2}$/.test(offset)) {
      //support "+01:00"
      if (/:00/.test(offset) === true) {
        offset = offset.replace(/:00/, '');
      }
      //support "+01:30"
      if (/:30/.test(offset) === true) {
        offset = offset.replace(/:30/, '.5');
      }
    }

    // for (+-)hhmm
    if (/^[+-]?[0-9]{4}$/.test(offset)) {
      offset = offset.replace(/30$/, '.5');
    }
    num = parseFloat(offset);

    //divide by 100 or 10 - , "+0100", "+01"
    if (Math.abs(num) > 100) {
      num = num / 100;
    }
    //this is a fancy-move
    if (num === 0 || offset === 'Z' || offset === 'z') {
      s.tz = 'etc/gmt';
      return s
    }
    //okay, try to match it to a utc timezone
    //remember - this is opposite! a -5 offset maps to Etc/GMT+5  ¯\_(:/)_/¯
    //https://askubuntu.com/questions/519550/why-is-the-8-timezone-called-gmt-8-in-the-filesystem
    num *= -1;

    if (num >= 0) {
      num = '+' + num;
    }
    let tz = 'etc/gmt' + num;
    let zones = s.timezones;

    if (zones[tz]) {
      // log a warning if we're over-writing a given timezone?
      // console.log('changing timezone to: ' + tz)
      s.tz = tz;
    }
    return s
  };

  // truncate any sub-millisecond values
  const parseMs = function (str = '') {
    str = String(str);
    //js does not support sub-millisecond values
    // so truncate these - 2021-11-02T19:55:30.087772
    if (str.length > 3) {
      str = str.substring(0, 3);
    } else if (str.length === 1) {
      // assume ms are zero-padded on the left
      // but maybe not on the right.
      // turn '.10' into '.100'
      str = str + '00';
    } else if (str.length === 2) {
      str = str + '0';
    }
    return Number(str) || 0
  };

  const parseTime = (s, str = '') => {
    // remove all whitespace
    str = str.replace(/^\s+/, '').toLowerCase();
    //formal time format - 04:30.23
    let arr = str.match(/([0-9]{1,2}):([0-9]{1,2}):?([0-9]{1,2})?[:.]?([0-9]{1,4})?/);
    if (arr !== null) {
      let [, h, m, sec, ms] = arr;
      //validate it a little
      h = Number(h);
      if (h < 0 || h > 24) {
        return s.startOf('day')
      }
      m = Number(m); //don't accept '5:3pm'
      if (arr[2].length < 2 || m < 0 || m > 59) {
        return s.startOf('day')
      }
      s = s.hour(h);
      s = s.minute(m);
      s = s.seconds(sec || 0);
      s = s.millisecond(parseMs(ms));
      //parse-out am/pm
      let ampm = str.match(/[0-9] ?(am|pm)\b/);
      if (ampm !== null && ampm[1]) {
        s = s.ampm(ampm[1]);
      }
      return s
    }

    //try an informal form - 5pm (no minutes)
    arr = str.match(/([0-9]+) ?(am|pm)/);
    if (arr !== null && arr[1]) {
      let h = Number(arr[1]);
      //validate it a little..
      if (h > 12 || h < 1) {
        return s.startOf('day')
      }
      s = s.hour(arr[1] || 0);
      s = s.ampm(arr[2]);
      s = s.startOf('hour');
      return s
    }

    //no time info found, use start-of-day
    s = s.startOf('day');
    return s
  };

  let months$1 = mapping$1();

  //given a month, return whether day number exists in it
  const validate$1 = (obj) => {
    //invalid values
    if (monthLengths.hasOwnProperty(obj.month) !== true) {
      return false
    }
    //support leap-year in february
    if (obj.month === 1) {
      if (isLeapYear(obj.year) && obj.date <= 29) {
        return true
      } else {
        return obj.date <= 28
      }
    }
    //is this date too-big for this month?
    let max = monthLengths[obj.month] || 0;
    if (obj.date <= max) {
      return true
    }
    return false
  };

  const parseYear = (str = '', today) => {
    str = str.trim();
    // parse '86 shorthand
    if (/^'[0-9][0-9]$/.test(str) === true) {
      let num = Number(str.replace(/'/, ''));
      if (num > 50) {
        return 1900 + num
      }
      return 2000 + num
    }
    let year = parseInt(str, 10);
    // use a given year from options.today
    if (!year && today) {
      year = today.year;
    }
    // fallback to this year
    year = year || new Date().getFullYear();
    return year
  };

  const parseMonth = function (str) {
    str = str.toLowerCase().trim();
    if (str === 'sept') {
      return months$1.sep
    }
    return months$1[str]
  };

  const parseTz = function (str) {
    str = str.trim();
    str = str.replace(/[[\]]/g, '');
    return str
  };

  var ymd = [
    // =====
    //  y-m-d
    // =====
    //iso-this 1998-05-30T22:00:00:000Z, iso-that 2017-04-03T08:00:00-0700
    // optionally supports Temporal fmt w/ [IANA]
    {
      reg: /^(-?0{0,2}[0-9]{3,4})-([0-9]{1,2})-([0-9]{1,2})[T| ]([0-9.:]+)(Z|[0-9-+:]+)?(\[.*?\])?(\[.*?\])?$/i,
      parse: (s, m) => {
        let obj = {
          year: m[1],
          month: parseInt(m[2], 10) - 1,
          date: m[3]
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        // if iana code in brackets at the end, set the timezone
        if (m[6]) {
          let tz = parseTz(m[6]);//TODO addme
          if (tz) {
            s = s.timezone(tz);
          }
        } else {
          parseOffset(s, m[5]);
        }
        // For now, ignore Temporal calendar info in m[7]..
        walkTo(s, obj);
        s = parseTime(s, m[4]);
        return s
      }
    },
    //short-iso "2015-03-25" or "2015/03/25" or "2015/03/25 12:26:14 PM"
    {
      reg: /^([0-9]{4})[\-/. ]([0-9]{1,2})[\-/. ]([0-9]{1,2})( [0-9]{1,2}(:[0-9]{0,2})?(:[0-9]{0,3})? ?(am|pm)?)?$/i,
      parse: (s, m) => {
        let obj = {
          year: m[1],
          month: parseInt(m[2], 10) - 1,
          date: parseInt(m[3], 10)
        };
        if (obj.month >= 12) {
          //support yyyy/dd/mm (weird, but ok)
          obj.date = parseInt(m[2], 10);
          obj.month = parseInt(m[3], 10) - 1;
        }
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s, m[4]);
        return s
      }
    },

    //text-month "2015-feb-25"
    {
      reg: /^([0-9]{4})[\-/. ]([a-z]+)[\-/. ]([0-9]{1,2})( [0-9]{1,2}(:[0-9]{0,2})?(:[0-9]{0,3})? ?(am|pm)?)?$/i,
      parse: (s, m) => {
        let obj = {
          year: parseYear(m[1], s._today),
          month: parseMonth(m[2]),
          date: toCardinal(m[3] || '')
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s, m[4]);
        return s
      }
    }
  ];

  var mdy = [
    // =====
    //  m-d-y
    // =====
    //mm/dd/yyyy - uk/canada "6/28/2019, 12:26:14 PM"
    {
      reg: /^([0-9]{1,2})[-/.]([0-9]{1,2})[\-/.]?([0-9]{4})?( [0-9]{1,2}:[0-9]{2}:?[0-9]{0,2} ?(am|pm|gmt))?$/i,
      parse: (s, arr) => {
        let month = parseInt(arr[1], 10) - 1;
        let date = parseInt(arr[2], 10);
        //support dd/mm/yyy
        if (s.british || month >= 12) {
          date = parseInt(arr[1], 10);
          month = parseInt(arr[2], 10) - 1;
        }
        let obj = {
          date,
          month,
          year: parseYear(arr[3], s._today) || new Date().getFullYear()
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s, arr[4]);
        return s
      }
    },
    //alt short format - "feb-25-2015"
    {
      reg: /^([a-z]+)[\-/. ]([0-9]{1,2})[\-/. ]?([0-9]{4}|'[0-9]{2})?( [0-9]{1,2}(:[0-9]{0,2})?(:[0-9]{0,3})? ?(am|pm)?)?$/i,
      parse: (s, arr) => {
        let obj = {
          year: parseYear(arr[3], s._today),
          month: parseMonth(arr[1]),
          date: toCardinal(arr[2] || '')
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s, arr[4]);
        return s
      }
    },

    //Long "Mar 25 2015"
    //February 22, 2017 15:30:00
    {
      reg: /^([a-z]+) ([0-9]{1,2})( [0-9]{4})?( ([0-9:]+( ?am| ?pm| ?gmt)?))?$/i,
      parse: (s, arr) => {
        let obj = {
          year: parseYear(arr[3], s._today),
          month: parseMonth(arr[1]),
          date: toCardinal(arr[2] || '')
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s, arr[4]);
        return s
      }
    },
    // 'Sun Mar 14 15:09:48 +0000 2021'
    {
      reg: /^([a-z]+) ([0-9]{1,2}) ([0-9]{1,2}:[0-9]{2}:?[0-9]{0,2})( \+[0-9]{4})?( [0-9]{4})?$/i,
      parse: (s, arr) => {
        let [, month, date, time, tz, year] = arr;
        let obj = {
          year: parseYear(year, s._today),
          month: parseMonth(month),
          date: toCardinal(date || '')
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseOffset(s, tz);
        s = parseTime(s, time);
        return s
      }
    }
  ];

  var dmy = [
    // =====
    //  d-m-y
    // =====
    //common british format - "25-feb-2015"
    {
      reg: /^([0-9]{1,2})[-/]([a-z]+)[\-/]?([0-9]{4})?$/i,
      parse: (s, m) => {
        let obj = {
          year: parseYear(m[3], s._today),
          month: parseMonth(m[2]),
          date: toCardinal(m[1] || '')
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s, m[4]);
        return s
      }
    },
    // "25 Mar 2015"
    {
      reg: /^([0-9]{1,2})( [a-z]+)( [0-9]{4}| '[0-9]{2})? ?([0-9]{1,2}:[0-9]{2}:?[0-9]{0,2} ?(am|pm|gmt))?$/i,
      parse: (s, m) => {
        let obj = {
          year: parseYear(m[3], s._today),
          month: parseMonth(m[2]),
          date: toCardinal(m[1])
        };
        if (!obj.month || validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s, m[4]);
        return s
      }
    },
    // 01-jan-2020
    {
      reg: /^([0-9]{1,2})[. \-/]([a-z]+)[. \-/]([0-9]{4})?( [0-9]{1,2}(:[0-9]{0,2})?(:[0-9]{0,3})? ?(am|pm)?)?$/i,
      parse: (s, m) => {
        let obj = {
          date: Number(m[1]),
          month: parseMonth(m[2]),
          year: Number(m[3])
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = s.startOf('day');
        s = parseTime(s, m[4]);
        return s
      }
    }
  ];

  var misc = [
    // =====
    // no dates
    // =====

    // '2012-06' month-only
    {
      reg: /^([0-9]{4})[\-/]([0-9]{2})$/,
      parse: (s, m) => {
        let obj = {
          year: m[1],
          month: parseInt(m[2], 10) - 1,
          date: 1
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s, m[4]);
        return s
      }
    },

    //February 2017 (implied date)
    {
      reg: /^([a-z]+) ([0-9]{4})$/i,
      parse: (s, arr) => {
        let obj = {
          year: parseYear(arr[2], s._today),
          month: parseMonth(arr[1]),
          date: s._today.date || 1
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s, arr[4]);
        return s
      }
    },

    {
      // 'q2 2002'
      reg: /^(q[0-9])( of)?( [0-9]{4})?/i,
      parse: (s, arr) => {
        let quarter = arr[1] || '';
        s = s.quarter(quarter);
        let year = arr[3] || '';
        if (year) {
          year = year.trim();
          s = s.year(year);
        }
        return s
      }
    },
    {
      // 'summer 2002'
      reg: /^(spring|summer|winter|fall|autumn)( of)?( [0-9]{4})?/i,
      parse: (s, arr) => {
        let season = arr[1] || '';
        s = s.season(season);
        let year = arr[3] || '';
        if (year) {
          year = year.trim();
          s = s.year(year);
        }
        return s
      }
    },
    {
      // '200bc'
      reg: /^[0-9,]+ ?b\.?c\.?$/i,
      parse: (s, arr) => {
        let str = arr[0] || '';
        //make year-negative
        str = str.replace(/^([0-9,]+) ?b\.?c\.?$/i, '-$1');
        let d = new Date();
        let obj = {
          year: parseInt(str.trim(), 10),
          month: d.getMonth(),
          date: d.getDate()
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s);
        return s
      }
    },
    {
      // '200ad'
      reg: /^[0-9,]+ ?(a\.?d\.?|c\.?e\.?)$/i,
      parse: (s, arr) => {
        let str = arr[0] || '';
        //remove commas
        str = str.replace(/,/g, '');
        let d = new Date();
        let obj = {
          year: parseInt(str.trim(), 10),
          month: d.getMonth(),
          date: d.getDate()
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s);
        return s
      }
    },
    {
      // '1992'
      reg: /^[0-9]{4}( ?a\.?d\.?)?$/i,
      parse: (s, arr) => {
        let today = s._today;
        // using today's date, but a new month is awkward.
        if (today.month && !today.date) {
          today.date = 1;
        }
        let d = new Date();
        let obj = {
          year: parseYear(arr[0], today),
          month: today.month || d.getMonth(),
          date: today.date || d.getDate()
        };
        if (validate$1(obj) === false) {
          s.epoch = null;
          return s
        }
        walkTo(s, obj);
        s = parseTime(s);
        return s
      }
    }
  ];

  var parsers = [].concat(ymd, mdy, dmy, misc);

  /* eslint-disable no-console */

  const parseString = function (s, input, givenTz) {
    // let parsers = s.parsers || []
    //try each text-parse template, use the first good result
    for (let i = 0; i < parsers.length; i++) {
      let m = input.match(parsers[i].reg);
      if (m) {
        let res = parsers[i].parse(s, m, givenTz);
        if (res !== null && res.isValid()) {
          return res
        }
      }
    }
    if (s.silent === false) {
      console.warn("Warning: couldn't parse date-string: '" + input + "'");
    }
    s.epoch = null;
    return s
  };

  const { parseArray, parseObject, parseNumber } = fns;
  //we have to actually parse these inputs ourselves
  //  -  can't use built-in js parser ;(
  //=========================================
  // ISO Date	  "2015-03-25"
  // Short Date	"03/25/2015" or "2015/03/25"
  // Long Date	"Mar 25 2015" or "25 Mar 2015"
  // Full Date	"Wednesday March 25 2015"
  //=========================================

  const defaults = {
    year: new Date().getFullYear(),
    month: 0,
    date: 1
  };

  //find the epoch from different input styles
  const parseInput = (s, input) => {
    let today = s._today || defaults;
    //if we've been given a epoch number, it's easy
    if (typeof input === 'number') {
      return parseNumber(s, input)
    }
    //set tmp time
    s.epoch = Date.now();
    // overwrite tmp time with 'today' value, if exists
    if (s._today && isObject(s._today) && Object.keys(s._today).length > 0) {
      let res = parseObject(s, today);
      if (res.isValid()) {
        s.epoch = res.epoch;
      }
    }
    // null input means 'now'
    if (input === null || input === undefined || input === '') {
      return s //k, we're good.
    }
    //support input of Date() object
    if (isDate(input) === true) {
      s.epoch = input.getTime();
      return s
    }
    //support [2016, 03, 01] format
    if (isArray(input) === true) {
      s = parseArray(s, input, today);
      return s
    }
    //support {year:2016, month:3} format
    if (isObject(input) === true) {
      //support spacetime object as input
      if (input.epoch) {
        s.epoch = input.epoch;
        s.tz = input.tz;
        return s
      }
      let obj = Object.assign({}, input, today);
      s = parseObject(s, obj);
      return s
    }
    //input as a string..
    if (typeof input !== 'string') {
      return s
    }
    //little cleanup..
    input = normalize(input);
    //try some known-words, like 'now'
    if (dates.hasOwnProperty(input) === true) {
      s = dates[input](s);
      return s
    }
    //try each text-parse template, use the first good result
    return parseString(s, input)
  };

  let shortDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  let longDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  function short() { return shortDays }
  function long() { return longDays }
  function set$4(i18n) {
    shortDays = i18n.short || shortDays;
    longDays = i18n.long || longDays;
  }
  const aliases$1 = {
    mo: 1,
    tu: 2,
    we: 3,
    th: 4,
    fr: 5,
    sa: 6,
    su: 7,
    tues: 2,
    weds: 3,
    wedn: 3,
    thur: 4,
    thurs: 4
  };

  let titleCaseEnabled = true;

  function useTitleCase() {
    return titleCaseEnabled
  }

  function set$3(val) {
    titleCaseEnabled = val;
  }

  // create the timezone offset part of an iso timestamp
  // it's kind of nuts how involved this is
  // "+01:00", "+0100", or simply "+01"
  const isoOffset = s => {
    let offset = s.timezone().current.offset;
    return !offset ? 'Z' : formatTimezone(offset, ':')
  };

  const applyCaseFormat = (str) => {
    if (useTitleCase()) {
      return titleCase$1(str)
    }
    return str
  };

  // iso-year padding
  const padYear = (num) => {
    if (num >= 0) {
      return zeroPad(num, 4)
    } else {
      num = Math.abs(num);
      return '-' + zeroPad(num, 4)
    }
  };

  const format = {
    day: (s) => applyCaseFormat(s.dayName()),
    'day-short': (s) => applyCaseFormat(short()[s.day()]),
    'day-number': (s) => s.day(),
    'day-ordinal': (s) => ordinal(s.day()),
    'day-pad': (s) => zeroPad(s.day()),

    date: (s) => s.date(),
    'date-ordinal': (s) => ordinal(s.date()),
    'date-pad': (s) => zeroPad(s.date()),

    month: (s) => applyCaseFormat(s.monthName()),
    'month-short': (s) => applyCaseFormat(short$1()[s.month()]),
    'month-number': (s) => s.month(),
    'month-ordinal': (s) => ordinal(s.month()),
    'month-pad': (s) => zeroPad(s.month()),
    'iso-month': (s) => zeroPad(s.month() + 1), //1-based months

    year: (s) => {
      let year = s.year();
      if (year > 0) {
        return year
      }
      year = Math.abs(year);
      return year + ' BC'
    },
    'year-short': (s) => {
      let year = s.year();
      if (year > 0) {
        return `'${String(s.year()).substr(2, 4)}`
      }
      year = Math.abs(year);
      return year + ' BC'
    },
    'iso-year': (s) => {
      let year = s.year();
      let isNegative = year < 0;
      let str = zeroPad(Math.abs(year), 4); //0-padded
      if (isNegative) {
        //negative years are for some reason 6-digits ('-00008')
        str = zeroPad(str, 6);
        str = '-' + str;
      }
      return str
    },

    time: (s) => s.time(),
    'time-24': (s) => `${s.hour24()}:${zeroPad(s.minute())}`,

    hour: (s) => s.hour12(),
    'hour-pad': (s) => zeroPad(s.hour12()),
    'hour-24': (s) => s.hour24(),
    'hour-24-pad': (s) => zeroPad(s.hour24()),

    minute: (s) => s.minute(),
    'minute-pad': (s) => zeroPad(s.minute()),
    second: (s) => s.second(),
    'second-pad': (s) => zeroPad(s.second()),
    millisecond: (s) => s.millisecond(),
    'millisecond-pad': (s) => zeroPad(s.millisecond(), 3),

    ampm: (s) => s.ampm(),
    AMPM: (s) => s.ampm().toUpperCase(),
    quarter: (s) => 'Q' + s.quarter(),
    season: (s) => s.season(),
    era: (s) => s.era(),
    json: (s) => s.json(),
    timezone: (s) => s.timezone().name,
    offset: (s) => isoOffset(s),

    numeric: (s) => `${s.year()}/${zeroPad(s.month() + 1)}/${zeroPad(s.date())}`, // yyyy/mm/dd
    'numeric-us': (s) => `${zeroPad(s.month() + 1)}/${zeroPad(s.date())}/${s.year()}`, // mm/dd/yyyy
    'numeric-uk': (s) => `${zeroPad(s.date())}/${zeroPad(s.month() + 1)}/${s.year()}`, //dd/mm/yyyy
    'mm/dd': (s) => `${zeroPad(s.month() + 1)}/${zeroPad(s.date())}`, //mm/dd

    // ... https://en.wikipedia.org/wiki/ISO_8601 ;(((
    iso: (s) => {
      let year = s.format('iso-year');
      let month = zeroPad(s.month() + 1); //1-based months
      let date = zeroPad(s.date());
      let hour = zeroPad(s.h24());
      let minute = zeroPad(s.minute());
      let second = zeroPad(s.second());
      let ms = zeroPad(s.millisecond(), 3);
      let offset = isoOffset(s);
      return `${year}-${month}-${date}T${hour}:${minute}:${second}.${ms}${offset}` //2018-03-09T08:50:00.000-05:00
    },
    'iso-short': (s) => {
      let month = zeroPad(s.month() + 1); //1-based months
      let date = zeroPad(s.date());
      let year = padYear(s.year());
      return `${year}-${month}-${date}` //2017-02-15
    },
    'iso-utc': (s) => {
      return new Date(s.epoch).toISOString() //2017-03-08T19:45:28.367Z
    },
    'iso-full': (s) => {
      let iso = s.format('iso');
      let iana = s.timezone().name;
      if (iana) {
        iso += `[${iana}]`;
      }
      return iso
    },

    sql: (s) => {
      let year = s.format('iso-year');
      let month = zeroPad(s.month() + 1); //1-based months
      let date = zeroPad(s.date());
      let hour = zeroPad(s.h24());
      let minute = zeroPad(s.minute());
      let second = zeroPad(s.second());
      return `${year}-${month}-${date} ${hour}:${minute}:${second}` //2017-03-08 19:45:28
    },

    //i made these up
    nice: (s) => `${short$1()[s.month()]} ${ordinal(s.date())}, ${s.time()}`,
    'nice-24': (s) =>
      `${short$1()[s.month()]} ${ordinal(s.date())}, ${s.hour24()}:${zeroPad(
      s.minute()
    )}`,
    'nice-year': (s) => `${short$1()[s.month()]} ${ordinal(s.date())}, ${s.year()}`,
    'nice-day': (s) =>
      `${short()[s.day()]} ${applyCaseFormat(short$1()[s.month()])} ${ordinal(
      s.date()
    )}`,
    'nice-full': (s) =>
      `${s.dayName()} ${applyCaseFormat(s.monthName())} ${ordinal(s.date())}, ${s.time()}`,
    'nice-full-24': (s) =>
      `${s.dayName()} ${applyCaseFormat(s.monthName())} ${ordinal(
      s.date()
    )}, ${s.hour24()}:${zeroPad(s.minute())}`
  };
  //aliases
  const aliases = {
    'day-name': 'day',
    'month-name': 'month',
    'iso 8601': 'iso',
    'iso 9075': 'sql',
    'time-h24': 'time-24',
    'time-12': 'time',
    'time-h12': 'time',
    tz: 'timezone',
    iana: 'timezone',
    'day-num': 'day-number',
    'month-num': 'month-number',
    'month-iso': 'iso-month',
    'year-iso': 'iso-year',
    'nice-short': 'nice',
    'nice-short-24': 'nice-24',
    mdy: 'numeric-us',
    dmy: 'numeric-uk',
    ymd: 'numeric',
    'yyyy/mm/dd': 'numeric',
    'mm/dd/yyyy': 'numeric-us',
    'dd/mm/yyyy': 'numeric-us',
    'little-endian': 'numeric-uk',
    'big-endian': 'numeric',
    'day-nice': 'nice-day'
  };
  Object.keys(aliases).forEach((k) => (format[k] = format[aliases[k]]));

  const printFormat = (s, str = '') => {
    //don't print anything if it's an invalid date
    if (s.isValid() !== true) {
      return ''
    }
    //support .format('month')
    if (format.hasOwnProperty(str)) {
      let out = format[str](s) || '';
      if (str !== 'json') {
        out = String(out);
        if (str.toLowerCase() !== 'ampm') {
          out = applyCaseFormat(out);
        }
      }
      return out
    }
    //support '{hour}:{minute}' notation
    if (str.indexOf('{') !== -1) {
      let sections = /\{(.+?)\}/g;
      str = str.replace(sections, (_, fmt) => {
        fmt = fmt.trim();
        if (fmt !== 'AMPM') {
          fmt = fmt.toLowerCase();
        }
        if (format.hasOwnProperty(fmt)) {
          let out = String(format[fmt](s));
          if (fmt.toLowerCase() !== 'ampm') {
            return applyCaseFormat(out)
          }
          return out
        }
        return ''
      });
      return str
    }

    return s.format('iso-short')
  };

  //parse this insane unix-time-templating thing, from the 19th century
  //http://unicode.org/reports/tr35/tr35-25.html#Date_Format_Patterns

  //time-symbols we support
  const mapping = {
    G: (s) => s.era(),
    GG: (s) => s.era(),
    GGG: (s) => s.era(),
    GGGG: (s) => (s.era() === 'AD' ? 'Anno Domini' : 'Before Christ'),
    //year
    y: (s) => s.year(),
    yy: (s) => {
      //last two chars
      return zeroPad(Number(String(s.year()).substr(2, 4)))
    },
    yyy: (s) => s.year(),
    yyyy: (s) => s.year(),
    yyyyy: (s) => '0' + s.year(),
    // u: (s) => {},//extended non-gregorian years

    //quarter
    Q: (s) => s.quarter(),
    QQ: (s) => s.quarter(),
    QQQ: (s) => s.quarter(),
    QQQQ: (s) => s.quarter(),

    //month
    M: (s) => s.month() + 1,
    MM: (s) => zeroPad(s.month() + 1),
    MMM: (s) => s.format('month-short'),
    MMMM: (s) => s.format('month'),

    //week
    w: (s) => s.week(),
    ww: (s) => zeroPad(s.week()),
    //week of month
    // W: (s) => s.week(),

    //date of month
    d: (s) => s.date(),
    dd: (s) => zeroPad(s.date()),
    //date of year
    D: (s) => s.dayOfYear(),
    DD: (s) => zeroPad(s.dayOfYear()),
    DDD: (s) => zeroPad(s.dayOfYear(), 3),

    // F: (s) => {},//date of week in month
    // g: (s) => {},//modified julian day

    //day
    E: (s) => s.format('day-short'),
    EE: (s) => s.format('day-short'),
    EEE: (s) => s.format('day-short'),
    EEEE: (s) => s.format('day'),
    EEEEE: (s) => s.format('day')[0],
    e: (s) => s.day(),
    ee: (s) => s.day(),
    eee: (s) => s.format('day-short'),
    eeee: (s) => s.format('day'),
    eeeee: (s) => s.format('day')[0],

    //am/pm
    a: (s) => s.ampm().toUpperCase(),
    aa: (s) => s.ampm().toUpperCase(),
    aaa: (s) => s.ampm().toUpperCase(),
    aaaa: (s) => s.ampm().toUpperCase(),

    //hour
    h: (s) => s.h12(),
    hh: (s) => zeroPad(s.h12()),
    H: (s) => s.hour(),
    HH: (s) => zeroPad(s.hour()),
    // j: (s) => {},//weird hour format

    m: (s) => s.minute(),
    mm: (s) => zeroPad(s.minute()),
    s: (s) => s.second(),
    ss: (s) => zeroPad(s.second()),

    //milliseconds
    SSS: (s) => zeroPad(s.millisecond(), 3),
    //milliseconds in the day
    A: (s) => s.epoch - s.startOf('day').epoch,
    //timezone
    z: (s) => s.timezone().name,
    zz: (s) => s.timezone().name,
    zzz: (s) => s.timezone().name,
    zzzz: (s) => s.timezone().name,
    Z: (s) => formatTimezone(s.timezone().current.offset),
    ZZ: (s) => formatTimezone(s.timezone().current.offset),
    ZZZ: (s) => formatTimezone(s.timezone().current.offset),
    ZZZZ: (s) => formatTimezone(s.timezone().current.offset, ':')
  };

  const addAlias = (char, to, n) => {
    let name = char;
    let toName = to;
    for (let i = 0; i < n; i += 1) {
      mapping[name] = mapping[toName];
      name += char;
      toName += to;
    }
  };
  addAlias('q', 'Q', 4);
  addAlias('L', 'M', 4);
  addAlias('Y', 'y', 4);
  addAlias('c', 'e', 4);
  addAlias('k', 'H', 2);
  addAlias('K', 'h', 2);
  addAlias('S', 's', 2);
  addAlias('v', 'z', 4);
  addAlias('V', 'Z', 4);

  // support unix-style escaping with ' character
  const escapeChars = function (arr) {
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i] === `'`) {
        // greedy-search for next apostrophe
        for (let o = i + 1; o < arr.length; o += 1) {
          if (arr[o]) {
            arr[i] += arr[o];
          }
          if (arr[o] === `'`) {
            arr[o] = null;
            break
          }
          arr[o] = null;
        }
      }
    }
    return arr.filter((ch) => ch)
  };

  //combine consecutive chars, like 'yyyy' as one.
  const combineRepeated = function (arr) {
    for (let i = 0; i < arr.length; i += 1) {
      let c = arr[i];
      // greedy-forward
      for (let o = i + 1; o < arr.length; o += 1) {
        if (arr[o] === c) {
          arr[i] += arr[o];
          arr[o] = null;
        } else {
          break
        }
      }
    }
    // '' means one apostrophe
    arr = arr.filter((ch) => ch);
    arr = arr.map((str) => {
      if (str === `''`) {
        str = `'`;
      }
      return str
    });
    return arr
  };

  const unixFmt = (s, str) => {
    let arr = str.split('');
    // support character escaping
    arr = escapeChars(arr);
    //combine 'yyyy' as string.
    arr = combineRepeated(arr);
    return arr.reduce((txt, c) => {
      if (mapping[c] !== undefined) {
        txt += mapping[c](s) || '';
      } else {
        // 'unescape'
        if (/^'.+'$/.test(c)) {
          c = c.replace(/'/g, '');
        }
        txt += c;
      }
      return txt
    }, '')
  };

  const units$3 = ['year', 'season', 'quarter', 'month', 'week', 'day', 'quarterHour', 'hour', 'minute'];

  const doUnit = function (s, k) {
    let start = s.clone().startOf(k);
    let end = s.clone().endOf(k);
    let duration = end.epoch - start.epoch;
    let percent = (s.epoch - start.epoch) / duration;
    return parseFloat(percent.toFixed(2))
  };

  //how far it is along, from 0-1
  const progress = (s, unit) => {
    if (unit) {
      unit = normalize$1(unit);
      return doUnit(s, unit)
    }
    let obj = {};
    units$3.forEach(k => {
      obj[k] = doUnit(s, k);
    });
    return obj
  };

  /* eslint-disable no-console */

  //round to either current, or +1 of this unit
  const nearest = (s, unit) => {
    //how far have we gone?
    let prog = s.progress();
    unit = normalize$1(unit);
    //fix camel-case for this one
    if (unit === 'quarterhour') {
      unit = 'quarterHour';
    }
    if (prog[unit] !== undefined) {
      // go forward one?
      if (prog[unit] > 0.5) {
        s = s.add(1, unit);
      }
      // go to start
      s = s.startOf(unit);
    } else if (s.silent === false) {
      console.warn("no known unit '" + unit + "'");
    }
    return s
  };

  //increment until dates are the same
  const climb = (a, b, unit) => {
    let i = 0;
    a = a.clone();
    while (a.isBefore(b)) {
      //do proper, expensive increment to catch all-the-tricks
      a = a.add(1, unit);
      i += 1;
    }
    //oops, we went too-far..
    if (a.isAfter(b, unit)) {
      i -= 1;
    }
    return i
  };

  // do a thurough +=1 on the unit, until they match
  // for speed-reasons, only used on day, month, week.
  const diffOne = (a, b, unit) => {
    if (a.isBefore(b)) {
      return climb(a, b, unit)
    } else {
      return climb(b, a, unit) * -1 //reverse it
    }
  };

  // don't do anything too fancy here.
  // 2020 - 2019 may be 1 year, or 0 years
  // - '1 year difference' means 366 days during a leap year
  const fastYear = (a, b) => {
    let years = b.year() - a.year();
    // should we decrement it by 1?
    a = a.year(b.year());
    if (a.isAfter(b)) {
      years -= 1;
    }
    return years
  };

  // use a waterfall-method for computing a diff of any 'pre-knowable' units
  // compute years, then compute months, etc..
  // ... then ms-math for any very-small units
  const diff = function (a, b) {
    // an hour is always the same # of milliseconds
    // so these units can be 'pre-calculated'
    let msDiff = b.epoch - a.epoch;
    let obj = {
      milliseconds: msDiff,
      seconds: parseInt(msDiff / 1000, 10)
    };
    obj.minutes = parseInt(obj.seconds / 60, 10);
    obj.hours = parseInt(obj.minutes / 60, 10);

    //do the year
    let tmp = a.clone();
    obj.years = fastYear(tmp, b);
    tmp = a.add(obj.years, 'year');

    //there's always 12 months in a year...
    obj.months = obj.years * 12;
    tmp = a.add(obj.months, 'month');
    obj.months += diffOne(tmp, b, 'month');

    // there's always 4 quarters in a year...
    obj.quarters = obj.years * 4;
    obj.quarters += parseInt((obj.months % 12) / 3, 10);

    // there's always atleast 52 weeks in a year..
    // (month * 4) isn't as close
    obj.weeks = obj.years * 52;
    tmp = a.add(obj.weeks, 'week');
    obj.weeks += diffOne(tmp, b, 'week');

    // there's always atleast 7 days in a week
    obj.days = obj.weeks * 7;
    tmp = a.add(obj.days, 'day');
    obj.days += diffOne(tmp, b, 'day');

    return obj
  };

  const reverseDiff = function (obj) {
    Object.keys(obj).forEach((k) => {
      obj[k] *= -1;
    });
    return obj
  };

  // this method counts a total # of each unit, between a, b.
  // '1 month' means 28 days in february
  // '1 year' means 366 days in a leap year
  const main$1 = function (a, b, unit) {
    b = beADate(b, a);
    //reverse values, if necessary
    let reversed = false;
    if (a.isAfter(b)) {
      let tmp = a;
      a = b;
      b = tmp;
      reversed = true;
    }
    //compute them all (i know!)
    let obj = diff(a, b);
    if (reversed) {
      obj = reverseDiff(obj);
    }
    //return just the requested unit
    if (unit) {
      //make sure it's plural-form
      unit = normalize$1(unit);
      if (/s$/.test(unit) !== true) {
        unit += 's';
      }
      if (unit === 'dates') {
        unit = 'days';
      }
      return obj[unit]
    }
    return obj
  };

  /*
  ISO 8601 duration format
  // https://en.wikipedia.org/wiki/ISO_8601#Durations
  "P3Y6M4DT12H30M5S"
  P the start of the duration representation.
  Y the number of years.
  M the number of months.
  W the number of weeks.
  D the number of days.
  T of the representation.
  H the number of hours.
  M the number of minutes.
  S the number of seconds.
  */

  const fmt = (n) => Math.abs(n) || 0;

  const toISO = function (diff) {
    let iso = 'P';
    iso += fmt(diff.years) + 'Y';
    iso += fmt(diff.months) + 'M';
    iso += fmt(diff.days) + 'DT';
    iso += fmt(diff.hours) + 'H';
    iso += fmt(diff.minutes) + 'M';
    iso += fmt(diff.seconds) + 'S';
    return iso
  };

  //get number of hours/minutes... between the two dates
  function getDiff(a, b) {
    const isBefore = a.isBefore(b);
    const later = isBefore ? b : a;
    let earlier = isBefore ? a : b;
    earlier = earlier.clone();
    const diff = {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
    Object.keys(diff).forEach((unit) => {
      if (earlier.isSame(later, unit)) {
        return
      }
      let max = earlier.diff(later, unit);
      earlier = earlier.add(max, unit);
      diff[unit] = max;
    });
    //reverse it, if necessary
    if (isBefore) {
      Object.keys(diff).forEach((u) => {
        if (diff[u] !== 0) {
          diff[u] *= -1;
        }
      });
    }
    return diff
  }

  let units$2 = {
      second: 'second',
      seconds: 'seconds',
      minute: 'minute',
      minutes: 'minutes',
      hour: 'hour',
      hours: 'hours',
      day: 'day',
      days: 'days',
      month: 'month',
      months: 'months',
      year: 'year',
      years: 'years',
  };

  function unitsString(unit) {
      return units$2[unit] || '';
  }

  function set$2(i18n = {}) {
      units$2 = {
          second: i18n.second || units$2.second,
          seconds: i18n.seconds || units$2.seconds,
          minute: i18n.minute || units$2.minute,
          minutes: i18n.minutes || units$2.minutes,
          hour: i18n.hour || units$2.hour,
          hours: i18n.hours || units$2.hours,
          day: i18n.day || units$2.day,
          days: i18n.days || units$2.days,
          month: i18n.month || units$2.month,
          months: i18n.months || units$2.months,
          year: i18n.year || units$2.year,
          years: i18n.years || units$2.years,
      };
  }

  let past = 'past';
  let future = 'future';
  let present = 'present';
  let now = 'now';
  let almost = 'almost';
  let over = 'over';
  let pastDistance = (value) => `${value} ago`;
  let futureDistance = (value) => `in ${value}`;

  function pastDistanceString(value) { return pastDistance(value) }
  function futureDistanceString(value) { return futureDistance(value) }
  function pastString() { return past }
  function futureString() { return future }
  function presentString() { return present }
  function nowString() { return now }
  function almostString() { return almost }
  function overString() { return over }

  function set$1(i18n) {
      pastDistance = i18n.pastDistance || pastDistance;
      futureDistance = i18n.futureDistance || futureDistance;
      past = i18n.past || past;
      future = i18n.future || future;
      present = i18n.present || present;
      now = i18n.now || now;
      almost = i18n.almost || almost;
      over = i18n.over || over;
  }

  //our conceptual 'break-points' for each unit

  const qualifiers = {
    months: {
      almost: 10,
      over: 4
    },
    days: {
      almost: 25,
      over: 10
    },
    hours: {
      almost: 20,
      over: 8
    },
    minutes: {
      almost: 50,
      over: 20
    },
    seconds: {
      almost: 50,
      over: 20
    }
  };

  // Expects a plural unit arg
  function pluralize(value, unit) {
    if (value === 1) {
      return value + ' ' + unitsString(unit.slice(0, -1))
    }
    return value + ' ' + unitsString(unit)
  }

  const toSoft = function (diff) {
    let rounded = null;
    let qualified = null;
    let abbreviated = [];
    let englishValues = [];
    //go through each value and create its text-representation
    Object.keys(diff).forEach((unit, i, units) => {
      const value = Math.abs(diff[unit]);
      if (value === 0) {
        return
      }
      abbreviated.push(value + unit[0]);
      const englishValue = pluralize(value, unit);
      englishValues.push(englishValue);
      if (!rounded) {
        rounded = englishValue;
        qualified = englishValue;
        if (i > 4) {
          return
        }
        //is it a 'almost' something, etc?
        const nextUnit = units[i + 1];
        const nextValue = Math.abs(diff[nextUnit]);
        if (nextValue > qualifiers[nextUnit].almost) {
          rounded = pluralize(value + 1, unit);
          qualified = almostString() + ' ' + rounded;
        } else if (nextValue > qualifiers[nextUnit].over) {
          qualified = overString() + ' ' + englishValue;
        }
      }
    });

    return { qualified, rounded, abbreviated, englishValues }
  };

  //by spencermountain + Shaun Grady

  //create the human-readable diff between the two dates
  const since = (start, end) => {
    end = beADate(end, start);
    const diff = getDiff(start, end);
    const isNow = Object.keys(diff).every((u) => !diff[u]);
    if (isNow === true) {
      return {
        diff,
        rounded: nowString(),
        qualified: nowString(),
        precise: nowString(),
        abbreviated: [],
        iso: 'P0Y0M0DT0H0M0S',
        direction: presentString(),
      }
    }
    let precise;
    let direction = futureString();

    let { rounded, qualified, englishValues, abbreviated } = toSoft(diff);

    //make them into a string
    precise = englishValues.splice(0, 2).join(', ');
    //handle before/after logic
    if (start.isAfter(end) === true) {
      rounded = pastDistanceString(rounded);
      qualified = pastDistanceString(qualified);
      precise = pastDistanceString(precise);
      direction = pastString();
    } else {
      rounded = futureDistanceString(rounded);
      qualified = futureDistanceString(qualified);
      precise = futureDistanceString(precise);
    }
    // https://en.wikipedia.org/wiki/ISO_8601#Durations
    // P[n]Y[n]M[n]DT[n]H[n]M[n]S 
    let iso = toISO(diff);
    return {
      diff,
      rounded,
      qualified,
      precise,
      abbreviated,
      iso,
      direction,
    }
  };

  //https://www.timeanddate.com/calendar/aboutseasons.html
  // Spring - from March 1 to May 31;
  // Summer - from June 1 to August 31;
  // Fall (autumn) - from September 1 to November 30; and,
  // Winter - from December 1 to February 28 (February 29 in a leap year).
  const north = [
    ['spring', 2, 1],
    ['summer', 5, 1],
    ['fall', 8, 1],
    ['autumn', 8, 1],
    ['winter', 11, 1] //dec 1
  ];
  const south = [
    ['fall', 2, 1],
    ['autumn', 2, 1],
    ['winter', 5, 1],
    ['spring', 8, 1],
    ['summer', 11, 1] //dec 1
  ];

  var seasons = { north, south };

  var quarters = [
    null,
    [0, 1], //jan 1
    [3, 1], //apr 1
    [6, 1], //july 1
    [9, 1] //oct 1
  ];

  const units$1 = {
    second: (s) => {
      walkTo(s, {
        millisecond: 0
      });
      return s
    },
    minute: (s) => {
      walkTo(s, {
        second: 0,
        millisecond: 0
      });
      return s
    },
    quarterhour: (s) => {
      let minute = s.minutes();
      if (minute >= 45) {
        s = s.minutes(45);
      } else if (minute >= 30) {
        s = s.minutes(30);
      } else if (minute >= 15) {
        s = s.minutes(15);
      } else {
        s = s.minutes(0);
      }
      walkTo(s, {
        second: 0,
        millisecond: 0
      });
      return s
    },
    hour: (s) => {
      walkTo(s, {
        minute: 0,
        second: 0,
        millisecond: 0
      });
      return s
    },
    day: (s) => {
      walkTo(s, {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      });
      return s
    },
    week: (s) => {
      let original = s.clone();
      s = s.day(s._weekStart); //monday
      if (s.isAfter(original)) {
        s = s.subtract(1, 'week');
      }
      walkTo(s, {
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      });
      return s
    },
    month: (s) => {
      walkTo(s, {
        date: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      });
      return s
    },
    quarter: (s) => {
      let q = s.quarter();
      if (quarters[q]) {
        walkTo(s, {
          month: quarters[q][0],
          date: quarters[q][1],
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        });
      }
      return s
    },
    season: (s) => {
      let current = s.season();
      let hem = 'north';
      if (s.hemisphere() === 'South') {
        hem = 'south';
      }
      for (let i = 0; i < seasons[hem].length; i++) {
        if (seasons[hem][i][0] === current) {
          //winter goes between years
          let year = s.year();
          if (current === 'winter' && s.month() < 3) {
            year -= 1;
          }
          walkTo(s, {
            year,
            month: seasons[hem][i][1],
            date: seasons[hem][i][2],
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0
          });
          return s
        }
      }
      return s
    },
    year: (s) => {
      walkTo(s, {
        month: 0,
        date: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
      });
      return s
    },
    decade: (s) => {
      s = s.startOf('year');
      let year = s.year();
      let decade = parseInt(year / 10, 10) * 10;
      s = s.year(decade);
      return s
    },
    century: (s) => {
      s = s.startOf('year');
      let year = s.year();
      // near 0AD goes '-1 | +1'
      let decade = parseInt(year / 100, 10) * 100;
      s = s.year(decade);
      return s
    }
  };
  units$1.date = units$1.day;

  const startOf = (a, unit) => {
    let s = a.clone();
    unit = normalize$1(unit);
    if (units$1[unit]) {
      return units$1[unit](s)
    }
    if (unit === 'summer' || unit === 'winter') {
      s = s.season(unit);
      return units$1.season(s)
    }
    return s
  };

  //piggy-backs off startOf
  const endOf = (a, unit) => {
    let s = a.clone();
    unit = normalize$1(unit);
    if (units$1[unit]) {
      // go to beginning, go to next one, step back 1ms
      s = units$1[unit](s); // startof
      s = s.add(1, unit);
      s = s.subtract(1, 'millisecond');
      return s
    }
    return s
  };

  //is it 'wednesday'?
  const isDay = function (unit) {
    if (short().find((s) => s === unit)) {
      return true
    }
    if (long().find((s) => s === unit)) {
      return true
    }
    return false
  };

  // return a list of the weeks/months/days between a -> b
  // returns spacetime objects in the timezone of the input
  const every = function (start, unit, end, stepCount = 1) {
    if (!unit || !end) {
      return []
    }
    //cleanup unit param
    unit = normalize$1(unit);
    //cleanup to param
    end = start.clone().set(end);
    //swap them, if they're backwards
    if (start.isAfter(end)) {
      let tmp = start;
      start = end;
      end = tmp;
    }
    //prevent going beyond end if unit/stepCount > than the range
    if (start.diff(end, unit) < stepCount) {
      return []
    }
    //support 'every wednesday'
    let d = start.clone();
    if (isDay(unit)) {
      d = d.next(unit);
      unit = 'week';
    } else {
      let first = d.startOf(unit);
      if (first.isBefore(start)) {
        d = d.next(unit);
      }
    }
    //okay, actually start doing it
    let result = [];
    while (d.isBefore(end)) {
      result.push(d);
      d = d.add(stepCount, unit);
    }
    return result
  };

  /* eslint-disable no-console */

  const parseDst = dst => {
    if (!dst) {
      return []
    }
    return dst.split('->')
  };

  //iana codes are case-sensitive, technically
  const titleCase = str => {
    str = str[0].toUpperCase() + str.substr(1);
    str = str.replace(/[/_-]([a-z])/gi, s => {
      return s.toUpperCase()
    });
    str = str.replace(/_(of|es)_/i, (s) => s.toLowerCase());
    str = str.replace(/\/gmt/i, '/GMT');
    str = str.replace(/\/utc/i, '/UTC');
    str = str.replace(/\/Dumontdurville$/i, '/DumontDUrville');
    str = str.replace(/\/Mcmurdo$/i, '/McMurdo');
    str = str.replace(/\/Port-au-prince$/i, '/Port-au-Prince');
    if (str === 'Utc') {
      str = 'UTC';
    }
    return str
  };

  //get metadata about this timezone
  const timezone = s => {
    let zones = s.timezones;
    let tz = s.tz;
    if (zones.hasOwnProperty(tz) === false) {
      tz = lookupTz(s.tz, zones);
    }
    if (tz === null) {
      if (s.silent === false) {
        console.warn("Warn: could not find given or local timezone - '" + s.tz + "'");
      }
      return {
        current: {
          epochShift: 0
        }
      }
    }
    let found = zones[tz];
    let result = {
      name: titleCase(tz),
      hasDst: Boolean(found.dst),
      default_offset: found.offset,
      //do north-hemisphere version as default (sorry!)
      hemisphere: found.hem === 's' ? 'South' : 'North',
      current: {}
    };

    if (result.hasDst) {
      let arr = parseDst(found.dst);
      result.change = {
        start: arr[0],
        back: arr[1]
      };
    }
    //find the offsets for summer/winter times
    //(these variable names are north-centric)
    let summer = found.offset; // (july)
    let winter = summer; // (january) assume it's the same for now
    if (result.hasDst === true) {
      if (result.hemisphere === 'North') {
        winter = summer - 1;
      } else {
        //southern hemisphere
        winter = found.offset + 1;
      }
    }

    //find out which offset to use right now
    //use 'summer' time july-time
    if (result.hasDst === false) {
      result.current.offset = summer;
      result.current.isDST = false;
    } else if (inSummerTime(s.epoch, result.change.start, result.change.back, summer, winter) === true) {
      result.current.offset = summer;
      result.current.isDST = result.hemisphere === 'North'; //dst 'on' in winter in north
    } else {
      //use 'winter' january-time
      result.current.offset = winter;
      result.current.isDST = result.hemisphere === 'South'; //dst 'on' in summer in south
    }
    return result
  };

  /* eslint-disable no-console */
  const units = [
    'century',
    'decade',
    'year',
    'month',
    'date',
    'day',
    'hour',
    'minute',
    'second',
    'millisecond'
  ];

  //the spacetime instance methods (also, the API)
  const methods$4 = {
    set: function (input, tz) {
      let s = this.clone();
      s = parseInput(s, input);
      if (tz) {
        s.tz = lookupTz(tz, s.timezones);
      }
      return s
    },
    timezone: function (tz) {
      // hot-swap the timezone, to avoid time-change 
      if (tz !== undefined) {
        let json = this.json();
        json.timezone = tz;
        return this.set(json, tz)
      }
      return timezone(this)
    },
    isDST: function () {
      return timezone(this).current.isDST
    },
    hasDST: function () {
      return timezone(this).hasDst
    },
    offset: function () {
      return timezone(this).current.offset * 60
    },
    hemisphere: function () {
      return timezone(this).hemisphere
    },
    format: function (fmt) {
      return printFormat(this, fmt)
    },
    unixFmt: function (fmt) {
      return unixFmt(this, fmt)
    },
    startOf: function (unit) {
      return startOf(this, unit)
    },
    endOf: function (unit) {
      return endOf(this, unit)
    },
    leapYear: function () {
      let year = this.year();
      return isLeapYear(year)
    },
    progress: function (unit) {
      return progress(this, unit)
    },
    nearest: function (unit) {
      return nearest(this, unit)
    },
    diff: function (d, unit) {
      return main$1(this, d, unit)
    },
    since: function (d) {
      if (!d) {
        d = this.clone().set();
      }
      return since(this, d)
    },
    next: function (unit) {
      let s = this.add(1, unit);
      return s.startOf(unit)
    },
    //the start of the previous year/week/century
    last: function (unit) {
      let s = this.subtract(1, unit);
      return s.startOf(unit)
    },
    isValid: function () {
      //null/undefined epochs
      if (!this.epoch && this.epoch !== 0) {
        return false
      }
      return !isNaN(this.d.getTime())
    },
    //travel to this timezone
    goto: function (tz) {
      let s = this.clone();
      s.tz = lookupTz(tz, s.timezones); //science!
      return s
    },
    //get each week/month/day between a -> b
    every: function (unit, to, stepCount) {
      // allow swapping these params:
      if (typeof unit === 'object' && typeof to === 'string') {
        let tmp = to;
        to = unit;
        unit = tmp;
      }
      return every(this, unit, to, stepCount)
    },
    isAwake: function () {
      let hour = this.hour();
      //10pm -> 8am
      if (hour < 8 || hour > 22) {
        return false
      }
      return true
    },
    isAsleep: function () {
      return !this.isAwake()
    },
    daysInMonth: function () {
      switch (this.month()) {
        case 0:
          return 31
        case 1:
          return this.leapYear() ? 29 : 28
        case 2:
          return 31
        case 3:
          return 30
        case 4:
          return 31
        case 5:
          return 30
        case 6:
          return 31
        case 7:
          return 31
        case 8:
          return 30
        case 9:
          return 31
        case 10:
          return 30
        case 11:
          return 31
        default:
          throw new Error('Invalid Month state.')
      }
    },
    //pretty-printing
    log: function () {
      console.log('');
      console.log(printFormat(this, 'nice-short'));
      return this
    },
    logYear: function () {
      console.log('');
      console.log(printFormat(this, 'full-short'));
      return this
    },
    json: function (input) {
      // setter for json input
      if (input !== undefined) {
        let s = this.clone();
        if (input.timezone) {
          s.tz = input.timezone;
        }
        for (let i = 0; i < units.length; i++) {
          let unit = units[i];
          if (input[unit] !== undefined) {
            s = s[unit](input[unit]);
          }
        }
        return s
      }
      // produce json output
      let obj = units.reduce((h, unit) => {
        h[unit] = this[unit]();
        return h
      }, {});
      obj.offset = this.timezone().current.offset;
      obj.timezone = this.tz;
      return obj
    },
    debug: function () {
      let tz = this.timezone();
      let date = this.format('MM') + ' ' + this.format('date-ordinal') + ' ' + this.year();
      date += '\n     - ' + this.format('time');
      console.log('\n\n', date + '\n     - ' + tz.name + ' (' + tz.current.offset + ')');
      return this
    },
    //alias of 'since' but opposite - like moment.js
    from: function (d) {
      d = this.clone().set(d);
      return d.since(this)
    },
    fromNow: function () {
      let d = this.clone().set(Date.now());
      return d.since(this)
    },
    weekStart: function (input) {
      //accept a number directly
      if (typeof input === 'number') {
        this._weekStart = input;
        return this
      }
      if (typeof input === 'string') {
        // accept 'wednesday'
        input = input.toLowerCase().trim();
        let num = short().indexOf(input);
        if (num === -1) {
          num = long().indexOf(input);
        }
        if (num === -1) {
          num = 1; //go back to default
        }
        this._weekStart = num;
      } else {
        console.warn('Spacetime Error: Cannot understand .weekStart() input:', input);
      }
      return this
    }
  };
  // aliases
  methods$4.inDST = methods$4.isDST;
  methods$4.round = methods$4.nearest;
  methods$4.each = methods$4.every;

  // javascript setX methods like setDate() can't be used because of the local bias
  //these methods wrap around them.

  const validate = (n) => {
    //handle number as a string
    if (typeof n === 'string') {
      n = parseInt(n, 10);
    }
    return n
  };

  const order$1 = ['year', 'month', 'date', 'hour', 'minute', 'second', 'millisecond'];

  //reduce hostile micro-changes when moving dates by millisecond
  const confirm = (s, tmp, unit) => {
    let n = order$1.indexOf(unit);
    let arr = order$1.slice(n, order$1.length);
    for (let i = 0; i < arr.length; i++) {
      let want = tmp[arr[i]]();
      s[arr[i]](want);
    }
    return s
  };

  // allow specifying setter direction
  const fwdBkwd = function (s, old, goFwd, unit) {
    if (goFwd === true && s.isBefore(old)) {
      s = s.add(1, unit);
    } else if (goFwd === false && s.isAfter(old)) {
      s = s.minus(1, unit);
    }
    return s
  };

  const milliseconds = function (s, n) {
    n = validate(n);
    let current = s.millisecond();
    let diff = current - n; //milliseconds to shift by
    return s.epoch - diff
  };

  const seconds = function (s, n, goFwd) {
    n = validate(n);
    let old = s.clone();
    let diff = s.second() - n;
    let shift = diff * o.second;
    s.epoch = s.epoch - shift;
    s = fwdBkwd(s, old, goFwd, 'minute'); // specify direction
    return s.epoch
  };

  const minutes = function (s, n, goFwd) {
    n = validate(n);
    let old = s.clone();
    let diff = s.minute() - n;
    let shift = diff * o.minute;
    s.epoch -= shift;
    confirm(s, old, 'second');
    s = fwdBkwd(s, old, goFwd, 'hour'); // specify direction
    return s.epoch
  };

  const hours = function (s, n, goFwd) {
    n = validate(n);
    if (n >= 24) {
      n = 24;
    } else if (n < 0) {
      n = 0;
    }
    let old = s.clone();
    let diff = s.hour() - n;
    let shift = diff * o.hour;
    s.epoch -= shift;
    // oops, did we change the day?
    if (s.date() !== old.date()) {
      s = old.clone();
      if (diff > 1) {
        diff -= 1;
      }
      if (diff < 1) {
        diff += 1;
      }
      shift = diff * o.hour;
      s.epoch -= shift;
    }
    walkTo(s, {
      hour: n
    });
    confirm(s, old, 'minute');
    s = fwdBkwd(s, old, goFwd, 'day'); // specify direction
    return s.epoch
  };

  const time = function (s, str, goFwd) {
    let m = str.match(/([0-9]{1,2})[:h]([0-9]{1,2})(:[0-9]{1,2})? ?(am|pm)?/);
    if (!m) {
      //fallback to support just '2am'
      m = str.match(/([0-9]{1,2}) ?(am|pm)/);
      if (!m) {
        return s.epoch
      }
      m.splice(2, 0, '0'); //add implicit 0 minutes
      m.splice(3, 0, ''); //add implicit seconds
    }
    let h24 = false;
    let hour = parseInt(m[1], 10);
    let minute = parseInt(m[2], 10);
    if (minute >= 60) {
      minute = 59;
    }
    if (hour > 12) {
      h24 = true;
    }
    //make the hour into proper 24h time
    if (h24 === false) {
      if (m[4] === 'am' && hour === 12) {
        //12am is midnight
        hour = 0;
      }
      if (m[4] === 'pm' && hour < 12) {
        //12pm is noon
        hour += 12;
      }
    }
    // handle seconds
    m[3] = m[3] || '';
    m[3] = m[3].replace(/:/, '');
    let sec = parseInt(m[3], 10) || 0;
    let old = s.clone();
    s = s.hour(hour);
    s = s.minute(minute);
    s = s.second(sec);
    s = s.millisecond(0);
    s = fwdBkwd(s, old, goFwd, 'day'); // specify direction
    return s.epoch
  };

  const date = function (s, n, goFwd) {
    n = validate(n);
    //avoid setting february 31st
    if (n > 28) {
      let month = s.month();
      let max = monthLengths[month];
      // support leap day in february
      if (month === 1 && n === 29 && isLeapYear(s.year())) {
        max = 29;
      }
      if (n > max) {
        n = max;
      }
    }
    //avoid setting < 0
    if (n <= 0) {
      n = 1;
    }
    let old = s.clone();
    walkTo(s, {
      date: n
    });
    s = fwdBkwd(s, old, goFwd, 'month'); // specify direction
    return s.epoch
  };

  const month = function (s, n, goFwd) {
    if (typeof n === 'string') {
      if (n === 'sept') {
        n = 'sep';
      }
      n = mapping$1()[n.toLowerCase()];
    }
    n = validate(n);
    //don't go past december
    if (n >= 12) {
      n = 11;
    }
    if (n <= 0) {
      n = 0;
    }

    let d = s.date();
    //there's no 30th of february, etc.
    if (d > monthLengths[n]) {
      //make it as close as we can..
      d = monthLengths[n];
    }
    let old = s.clone();
    walkTo(s, {
      month: n,
      d
    });
    s = fwdBkwd(s, old, goFwd, 'year'); // specify direction
    return s.epoch
  };

  const year = function (s, n) {
    // support '97
    if (typeof n === 'string' && /^'[0-9]{2}$/.test(n)) {
      n = n.replace(/'/, '').trim();
      n = Number(n);
      // '89 is 1989
      if (n > 30) {
        //change this in 10y
        n = 1900 + n;
      } else {
        // '12 is 2012
        n = 2000 + n;
      }
    }
    n = validate(n);
    walkTo(s, {
      year: n
    });
    return s.epoch
  };

  const week = function (s, n, goFwd) {
    let old = s.clone();
    n = validate(n);

    // don't set week=1, if we're already week=1 in late december
    // because this could send us to another year
    if (n === 1) {
      if (s.monthName() === 'december' && s.date() >= 29) {
        if (s.week() === 1) {
          return s
        }
      }
    }

    // get the first week of the year
    s = s.month(0);
    s = s.date(1);
    s = s.day('monday', false);//go backwards to monday
    // did we go back too far?
    if (s.monthName() === 'december' && s.date() < 29) {
      s = s.add(1, 'week');
    }
    n -= 1; //1-based
    s = s.add(n, 'weeks');
    s = fwdBkwd(s, old, goFwd, 'year'); // specify direction
    return s
  };

  const dayOfYear = function (s, n, goFwd) {
    n = validate(n);
    let old = s.clone();
    n -= 1; //days are 1-based
    if (n <= 0) {
      n = 0;
    } else if (n >= 365) {
      if (isLeapYear(s.year())) {
        n = 365;
      } else {
        n = 364;
      }
    }
    s = s.startOf('year');
    s = s.add(n, 'day');
    confirm(s, old, 'hour');
    s = fwdBkwd(s, old, goFwd, 'year'); // specify direction
    return s.epoch
  };

  let morning = 'am';
  let evening = 'pm';

  function am() { return morning }
  function pm() { return evening }
  function set(i18n) {
      morning = i18n.am || morning;
      evening = i18n.pm || evening;
  }

  const methods$3 = {
    millisecond: function (num) {
      if (num !== undefined) {
        let s = this.clone();
        s.epoch = milliseconds(s, num);
        return s
      }
      return this.d.getMilliseconds()
    },
    second: function (num, goFwd) {
      if (num !== undefined) {
        let s = this.clone();
        s.epoch = seconds(s, num, goFwd);
        return s
      }
      return this.d.getSeconds()
    },
    minute: function (num, goFwd) {
      if (num !== undefined) {
        let s = this.clone();
        s.epoch = minutes(s, num, goFwd);
        return s
      }
      return this.d.getMinutes()
    },
    hour: function (num, goFwd) {
      let d = this.d;
      if (num !== undefined) {
        let s = this.clone();
        s.epoch = hours(s, num, goFwd);
        return s
      }
      return d.getHours()
    },

    //'3:30' is 3.5
    hourFloat: function (num, goFwd) {
      if (num !== undefined) {
        let s = this.clone();
        let minute = num % 1;
        minute = minute * 60;
        let hour = parseInt(num, 10);
        s.epoch = hours(s, hour, goFwd);
        s.epoch = minutes(s, minute, goFwd);
        return s
      }
      let d = this.d;
      let hour = d.getHours();
      let minute = d.getMinutes();
      minute = minute / 60;
      return hour + minute
    },

    // hour in 12h format
    hour12: function (str, goFwd) {
      let d = this.d;
      if (str !== undefined) {
        let s = this.clone();
        str = '' + str;
        let m = str.match(/^([0-9]+)(am|pm)$/);
        if (m) {
          let hour = parseInt(m[1], 10);
          if (m[2] === 'pm') {
            hour += 12;
          }
          s.epoch = hours(s, hour, goFwd);
        }
        return s
      }
      //get the hour
      let hour12 = d.getHours();
      if (hour12 > 12) {
        hour12 = hour12 - 12;
      }
      if (hour12 === 0) {
        hour12 = 12;
      }
      return hour12
    },

    //some ambiguity here with 12/24h
    time: function (str, goFwd) {
      if (str !== undefined) {
        let s = this.clone();
        str = str.toLowerCase().trim();
        s.epoch = time(s, str, goFwd);
        return s
      }
      return `${this.h12()}:${zeroPad(this.minute())}${this.ampm()}`
    },

    // either 'am' or 'pm'
    ampm: function (input, goFwd) {
      // let which = 'am'
      let which = am();
      let hour = this.hour();
      if (hour >= 12) {
        // which = 'pm'
        which = pm();
      }
      if (typeof input !== 'string') {
        return which
      }
      //okay, we're doing a setter
      let s = this.clone();
      input = input.toLowerCase().trim();
      //ampm should never change the day
      // - so use `.hour(n)` instead of `.minus(12,'hour')`
      if (hour >= 12 && input === 'am') {
        //noon is 12pm
        hour -= 12;
        return s.hour(hour, goFwd)
      }
      if (hour < 12 && input === 'pm') {
        hour += 12;
        return s.hour(hour, goFwd)
      }
      return s
    },

    //some hard-coded times of day, like 'noon'
    dayTime: function (str, goFwd) {
      if (str !== undefined) {
        const times = {
          morning: '7:00',
          breakfast: '7:00',
          noon: '12:00',
          lunch: '12:00',
          afternoon: '14:00',
          evening: '18:00',
          dinner: '18:00',
          night: '23:00',
          midnight: '00:00'
        };
        let s = this.clone();
        str = str || '';
        str = str.toLowerCase();
        if (times.hasOwnProperty(str) === true) {
          s = s.time(times[str], goFwd);
        }
        return s
      }
      let h = this.hour();
      if (h < 6) {
        return 'night'
      }
      if (h < 12) {
        //until noon
        return 'morning'
      }
      if (h < 17) {
        //until 5pm
        return 'afternoon'
      }
      if (h < 22) {
        //until 10pm
        return 'evening'
      }
      return 'night'
    },

    //get/set a traditional iso string
    iso: function (num) {
      if (num !== undefined) {
        return this.set(num)
      }
      return this.format('iso')
    },
    // get/set a new iso string
    isoFull: function (num) {
      if (num !== undefined) {
        return this.set(num)
      }
      return this.format('iso-full')
    },
    epochSeconds: function (num) {
      if (num !== undefined) {
        this.epoch = num * 1000;
        return this
      }
      return Math.floor(this.epoch / 1000)
    }
  };

  const methods$2 = {
    // # day in the month
    date: function (num, goFwd) {
      if (num !== undefined) {
        let s = this.clone();
        num = parseInt(num, 10);
        if (num) {
          s.epoch = date(s, num, goFwd);
        }
        return s
      }
      return this.d.getDate()
    },

    //like 'wednesday' (hard!)
    day: function (input, goFwd) {
      if (input === undefined) {
        return this.d.getDay()
      }
      let original = this.clone();
      let want = input;
      // accept 'wednesday'
      if (typeof input === 'string') {
        input = input.toLowerCase();
        if (aliases$1.hasOwnProperty(input)) {
          want = aliases$1[input];
        } else {
          want = short().indexOf(input);
          if (want === -1) {
            want = long().indexOf(input);
          }
        }
      }
      //move approx
      let day = this.d.getDay();
      let diff = day - want;
      if (goFwd === true && diff > 0) {
        diff = diff - 7;
      }
      if (goFwd === false && diff < 0) {
        diff = diff + 7;
      }
      let s = this.subtract(diff, 'days');
      //tighten it back up
      walkTo(s, {
        hour: original.hour(),
        minute: original.minute(),
        second: original.second()
      });
      return s
    },

    //these are helpful name-wrappers
    dayName: function (input, goFwd) {
      if (input === undefined) {
        return long()[this.day()]
      }
      let s = this.clone();
      s = s.day(input, goFwd);
      return s
    }
  };

  /* eslint-disable no-console */

  const clearMinutes = (s) => {
    s = s.minute(0);
    s = s.second(0);
    s = s.millisecond(1);
    return s
  };

  const methods$1 = {
    // day 0-366
    dayOfYear: function (num, goFwd) {
      if (num !== undefined) {
        let s = this.clone();
        s.epoch = dayOfYear(s, num, goFwd);
        return s
      }
      //days since newyears - jan 1st is 1, jan 2nd is 2...
      let sum = 0;
      let month = this.d.getMonth();
      let tmp;
      //count the num days in each month
      for (let i = 1; i <= month; i++) {
        tmp = new Date();
        tmp.setDate(1);
        tmp.setFullYear(this.d.getFullYear()); //the year matters, because leap-years
        tmp.setHours(1);
        tmp.setMinutes(1);
        tmp.setMonth(i);
        tmp.setHours(-2); //the last day of the month
        sum += tmp.getDate();
      }
      return sum + this.d.getDate()
    },

    //since the start of the year
    week: function (num, goFwd) {
      // week-setter
      if (num !== undefined) {
        let s = this.clone();
        s = week(s, num, goFwd);
        s = clearMinutes(s);
        return s
      }
      //find-out which week it is:
      const thisOne = this.epoch;
      let tmp = this.clone();

      // first - are we in week 1 of the next year?
      if (tmp.monthName() === 'december' && tmp.date() >= 29) {
        let startNext = week(tmp.add(15, 'days'), 1, false);
        if (startNext.epoch <= tmp.epoch) {
          return 1
        }
      }
      // Ok, calculate which week we're in:
      // go to the first week of the year
      tmp = tmp.month(0); // go to jan 1
      tmp = tmp.date(1);
      tmp = clearMinutes(tmp);
      tmp = tmp.day('monday', false); // go backward to monday
      if (tmp.monthName() === 'december' && tmp.date() < 29) {
        tmp = tmp.add(1, 'week');
      }

      tmp = tmp.minus(2, 'hours'); // fudge for any DST
      //if the week technically hasn't started yet
      if (tmp.epoch > thisOne) {
        return 1
      }
      //speed it up, if we can
      let i = 0;
      let skipWeeks = this.month() * 4;
      tmp.epoch += o.week * skipWeeks;
      i += skipWeeks;
      for (; i <= 52; i++) {
        if (tmp.epoch > thisOne) {
          return i
        }
        tmp = tmp.add(1, 'week');
      }
      return 52
    },
    //either name or number
    month: function (input, goFwd) {
      if (input !== undefined) {
        let s = this.clone();
        s.epoch = month(s, input, goFwd);
        return s
      }
      return this.d.getMonth()
    },
    //'january'
    monthName: function (input, goFwd) {
      if (input !== undefined) {
        let s = this.clone();
        s = s.month(input, goFwd);
        return s
      }
      return long$1()[this.month()]
    },

    //q1, q2, q3, q4
    quarter: function (num, goFwd) {
      if (num !== undefined) {
        if (typeof num === 'string') {
          num = num.replace(/^q/i, '');
          num = parseInt(num, 10);
        }
        if (quarters[num]) {
          let s = this.clone();
          let month = quarters[num][0];
          s = s.month(month, goFwd);
          s = s.date(1, goFwd);
          s = s.startOf('day');
          return s
        }
      }
      let month = this.d.getMonth();
      for (let i = 1; i < quarters.length; i++) {
        if (month < quarters[i][0]) {
          return i - 1
        }
      }
      return 4
    },

    //spring, summer, winter, fall
    season: function (input, goFwd) {
      let hem = 'north';
      if (this.hemisphere() === 'South') {
        hem = 'south';
      }
      if (input !== undefined) {    // setter
        let s = this.clone();
        for (let i = 0; i < seasons[hem].length; i++) {
          if (input === seasons[hem][i][0]) {
            s = s.month(seasons[hem][i][1], goFwd);
            s = s.date(1);
            s = s.startOf('day');
          }
        }
        return s
      }
      let month = this.d.getMonth();
      for (let i = 0; i < seasons[hem].length - 1; i++) {
        if (month >= seasons[hem][i][1] && month < seasons[hem][i + 1][1]) {
          return seasons[hem][i][0]
        }
      }
      return hem === 'north' ? 'winter' : 'summer'
    },

    //the year number
    year: function (num) {
      if (num !== undefined) {
        let s = this.clone();
        s.epoch = year(s, num);
        return s
      }
      return this.d.getFullYear()
    },

    //bc/ad years
    era: function (str) {
      if (str !== undefined) {
        let s = this.clone();
        str = str.toLowerCase();
        //TODO: there is no year-0AD i think. may have off-by-1 error here
        let year$1 = s.d.getFullYear();
        //make '1992' into 1992bc..
        if (str === 'bc' && year$1 > 0) {
          s.epoch = year(s, year$1 * -1);
        }
        //make '1992bc' into '1992'
        if (str === 'ad' && year$1 < 0) {
          s.epoch = year(s, year$1 * -1);
        }
        return s
      }
      if (this.d.getFullYear() < 0) {
        return 'BC'
      }
      return 'AD'
    },

    // 2019 -> 2010
    decade: function (input) {
      if (input !== undefined) {
        input = String(input);
        input = input.replace(/([0-9])'?s$/, '$1'); //1950's
        input = input.replace(/([0-9])(th|rd|st|nd)/, '$1'); //fix ordinals
        if (!input) {
          console.warn('Spacetime: Invalid decade input');
          return this
        }
        // assume 20th century?? for '70s'.
        if (input.length === 2 && /[0-9][0-9]/.test(input)) {
          input = '19' + input;
        }
        let year = Number(input);
        if (isNaN(year)) {
          return this
        }
        // round it down to the decade
        year = Math.floor(year / 10) * 10;
        return this.year(year) //.startOf('decade')
      }
      return this.startOf('decade').year()
    },
    // 1950 -> 19+1
    century: function (input) {
      if (input !== undefined) {
        if (typeof input === 'string') {
          input = input.replace(/([0-9])(th|rd|st|nd)/, '$1'); //fix ordinals
          input = input.replace(/([0-9]+) ?(b\.?c\.?|a\.?d\.?)/i, (a, b, c) => {
            if (c.match(/b\.?c\.?/i)) {
              b = '-' + b;
            }
            return b
          });
          input = input.replace(/c$/, ''); //20thC
        }
        let year = Number(input);
        if (isNaN(input)) {
          console.warn('Spacetime: Invalid century input');
          return this
        }
        // there is no century 0
        if (year === 0) {
          year = 1;
        }
        if (year >= 0) {
          year = (year - 1) * 100;
        } else {
          year = (year + 1) * 100;
        }
        return this.year(year)
      }
      // century getter
      let num = this.startOf('century').year();
      num = Math.floor(num / 100);
      if (num < 0) {
        return num - 1
      }
      return num + 1
    },
    // 2019 -> 2+1
    millenium: function (input) {
      if (input !== undefined) {
        if (typeof input === 'string') {
          input = input.replace(/([0-9])(th|rd|st|nd)/, '$1'); //fix ordinals
          input = Number(input);
          if (isNaN(input)) {
            console.warn('Spacetime: Invalid millenium input');
            return this
          }
        }
        if (input > 0) {
          input -= 1;
        }
        let year = input * 1000;
        // there is no year 0
        if (year === 0) {
          year = 1;
        }
        return this.year(year)
      }
      // get the current millenium
      let num = Math.floor(this.year() / 1000);
      if (num >= 0) {
        num += 1;
      }
      return num
    }
  };

  const methods = Object.assign({}, methods$3, methods$2, methods$1);

  //aliases
  methods.milliseconds = methods.millisecond;
  methods.seconds = methods.second;
  methods.minutes = methods.minute;
  methods.hours = methods.hour;
  methods.hour24 = methods.hour;
  methods.h12 = methods.hour12;
  methods.h24 = methods.hour24;
  methods.days = methods.day;

  const addMethods$4 = Space => {
    //hook the methods into prototype
    Object.keys(methods).forEach(k => {
      Space.prototype[k] = methods[k];
    });
  };

  const getMonthLength = function (month, year) {
    if (month === 1 && isLeapYear(year)) {
      return 29
    }
    return monthLengths[month]
  };

  //month is the one thing we 'model/compute'
  //- because ms-shifting can be off by enough
  const rollMonth = (want, old) => {
    //increment year
    if (want.month > 0) {
      let years = parseInt(want.month / 12, 10);
      want.year = old.year() + years;
      want.month = want.month % 12;
    } else if (want.month < 0) {
      let m = Math.abs(want.month);
      let years = parseInt(m / 12, 10);
      if (m % 12 !== 0) {
        years += 1;
      }
      want.year = old.year() - years;
      //ignore extras
      want.month = want.month % 12;
      want.month = want.month + 12;
      if (want.month === 12) {
        want.month = 0;
      }
    }
    return want
  };

  // briefly support day=-2 (this does not need to be perfect.)
  const rollDaysDown = (want, old, sum) => {
    want.year = old.year();
    want.month = old.month();
    let date = old.date();
    want.date = date - Math.abs(sum);
    while (want.date < 1) {
      want.month -= 1;
      if (want.month < 0) {
        want.month = 11;
        want.year -= 1;
      }
      let max = getMonthLength(want.month, want.year);
      want.date += max;
    }
    return want
  };

  // briefly support day=33 (this does not need to be perfect.)
  const rollDaysUp = (want, old, sum) => {
    let year = old.year();
    let month = old.month();
    let max = getMonthLength(month, year);
    while (sum > max) {
      sum -= max;
      month += 1;
      if (month >= 12) {
        month -= 12;
        year += 1;
      }
      max = getMonthLength(month, year);
    }
    want.month = month;
    want.date = sum;
    return want
  };

  const months = rollMonth;
  const days = rollDaysUp;
  const daysBack = rollDaysDown;

  // this logic is a bit of a mess,
  // but briefly:
  // millisecond-math, and some post-processing covers most-things
  // we 'model' the calendar here only a little bit
  // and that usually works-out...

  const order = ['millisecond', 'second', 'minute', 'hour', 'date', 'month'];
  let keep = {
    second: order.slice(0, 1),
    minute: order.slice(0, 2),
    quarterhour: order.slice(0, 2),
    hour: order.slice(0, 3),
    date: order.slice(0, 4),
    month: order.slice(0, 4),
    quarter: order.slice(0, 4),
    season: order.slice(0, 4),
    year: order,
    decade: order,
    century: order
  };
  keep.week = keep.hour;
  keep.season = keep.date;
  keep.quarter = keep.date;

  // Units need to be dst adjuested
  const dstAwareUnits = {
    year: true,
    quarter: true,
    season: true,
    month: true,
    week: true,
    date: true
  };

  const keepDate = {
    month: true,
    quarter: true,
    season: true,
    year: true
  };

  const addMethods$3 = (SpaceTime) => {
    SpaceTime.prototype.add = function (num, unit) {
      let s = this.clone();

      if (!unit || num === 0) {
        return s //don't bother
      }
      let old = this.clone();
      unit = normalize$1(unit);
      if (unit === 'millisecond') {
        s.epoch += num;
        return s
      }
      // support 'fortnight' alias
      if (unit === 'fortnight') {
        num *= 2;
        unit = 'week';
      }
      //move forward by the estimated milliseconds (rough)
      if (o[unit]) {
        s.epoch += o[unit] * num;
      } else if (unit === 'week' || unit === 'weekend') {
        s.epoch += o.day * (num * 7);
      } else if (unit === 'quarter' || unit === 'season') {
        s.epoch += o.month * (num * 3);
      } else if (unit === 'quarterhour') {
        s.epoch += o.minute * 15 * num;
      }
      //now ensure our milliseconds/etc are in-line
      let want = {};
      if (keep[unit]) {
        keep[unit].forEach((u) => {
          want[u] = old[u]();
        });
      }

      if (dstAwareUnits[unit]) {
        const diff = old.timezone().current.offset - s.timezone().current.offset;
        s.epoch += diff * 3600 * 1000;
      }

      //ensure month/year has ticked-over
      if (unit === 'month') {
        want.month = old.month() + num;
        //month is the one unit we 'model' directly
        want = months(want, old);
      }
      //support coercing a week, too
      if (unit === 'week') {
        let sum = old.date() + (num * 7);
        if (sum <= 28 && sum > 1) {
          want.date = sum;
        }
      }
      if (unit === 'weekend' && s.dayName() !== 'saturday') {
        s = s.day('saturday', true); //ensure it's saturday
      }
      //support 25-hour day-changes on dst-changes
      else if (unit === 'date') {
        if (num < 0) {
          want = daysBack(want, old, num);
        } else {
          //specify a naive date number, if it's easy to do...
          let sum = old.date() + num;
          // ok, model this one too
          want = days(want, old, sum);
        }
        //manually punt it if we haven't moved at all..
        if (num !== 0 && old.isSame(s, 'day')) {
          want.date = old.date() + num;
        }
      }
      // ensure a quarter is 3 months over
      else if (unit === 'quarter') {
        want.month = old.month() + (num * 3);
        want.year = old.year();
        // handle rollover
        if (want.month < 0) {
          let years = Math.floor(want.month / 12);
          let remainder = want.month + (Math.abs(years) * 12);
          want.month = remainder;
          want.year += years;
        } else if (want.month >= 12) {
          let years = Math.floor(want.month / 12);
          want.month = want.month % 12;
          want.year += years;
        }
        want.date = old.date();
      }
      //ensure year has changed (leap-years)
      else if (unit === 'year') {
        let wantYear = old.year() + num;
        let haveYear = s.year();
        if (haveYear < wantYear) {
          let toAdd = Math.floor(num / 4) || 1; //approx num of leap-days
          s.epoch += Math.abs(o.day * toAdd);
        } else if (haveYear > wantYear) {
          let toAdd = Math.floor(num / 4) || 1; //approx num of leap-days
          s.epoch += o.day * toAdd;
        }
      }
      //these are easier
      else if (unit === 'decade') {
        want.year = s.year() + 10;
      } else if (unit === 'century') {
        want.year = s.year() + 100;
      }
      //keep current date, unless the month doesn't have it.
      if (keepDate[unit]) {
        let max = monthLengths[want.month];
        want.date = old.date();
        if (want.date > max) {
          want.date = max;
        }
      }
      if (Object.keys(want).length > 1) {
        walkTo(s, want);
      }
      return s
    };

    //subtract is only add *-1
    SpaceTime.prototype.subtract = function (num, unit) {
      let s = this.clone();
      return s.add(num * -1, unit)
    };
    //add aliases
    SpaceTime.prototype.minus = SpaceTime.prototype.subtract;
    SpaceTime.prototype.plus = SpaceTime.prototype.add;
  };

  //make a string, for easy comparison between dates
  const print = {
    millisecond: (s) => {
      return s.epoch
    },
    second: (s) => {
      return [s.year(), s.month(), s.date(), s.hour(), s.minute(), s.second()].join('-')
    },
    minute: (s) => {
      return [s.year(), s.month(), s.date(), s.hour(), s.minute()].join('-')
    },
    hour: (s) => {
      return [s.year(), s.month(), s.date(), s.hour()].join('-')
    },
    day: (s) => {
      return [s.year(), s.month(), s.date()].join('-')
    },
    week: (s) => {
      return [s.year(), s.week()].join('-')
    },
    month: (s) => {
      return [s.year(), s.month()].join('-')
    },
    quarter: (s) => {
      return [s.year(), s.quarter()].join('-')
    },
    year: (s) => {
      return s.year()
    }
  };
  print.date = print.day;

  const addMethods$2 = (SpaceTime) => {
    SpaceTime.prototype.isSame = function (b, unit, tzAware = true) {
      let a = this;
      if (!unit) {
        return null
      }
      // support swapped params
      if (typeof b === 'string' && typeof unit === 'object') {
        let tmp = b;
        b = unit;
        unit = tmp;
      }
      if (typeof b === 'string' || typeof b === 'number') {
        b = new SpaceTime(b, this.timezone.name);
      }
      //support 'seconds' aswell as 'second'
      unit = unit.replace(/s$/, '');

      // make them the same timezone for proper comparison
      if (tzAware === true && a.tz !== b.tz) {
        b = b.clone();
        b.tz = a.tz;
      }
      if (print[unit]) {
        return print[unit](a) === print[unit](b)
      }
      return null
    };
  };

  const addMethods$1 = SpaceTime => {
    const methods = {
      isAfter: function (d) {
        d = beADate(d, this);
        let epoch = getEpoch(d);
        if (epoch === null) {
          return null
        }
        return this.epoch > epoch
      },
      isBefore: function (d) {
        d = beADate(d, this);
        let epoch = getEpoch(d);
        if (epoch === null) {
          return null
        }
        return this.epoch < epoch
      },
      isEqual: function (d) {
        d = beADate(d, this);
        let epoch = getEpoch(d);
        if (epoch === null) {
          return null
        }
        return this.epoch === epoch
      },
      isBetween: function (start, end, isInclusive = false) {
        start = beADate(start, this);
        end = beADate(end, this);
        let startEpoch = getEpoch(start);
        if (startEpoch === null) {
          return null
        }
        let endEpoch = getEpoch(end);
        if (endEpoch === null) {
          return null
        }
        if (isInclusive) {
          return this.isBetween(start, end) || this.isEqual(start) || this.isEqual(end);
        }
        return startEpoch < this.epoch && this.epoch < endEpoch
      }
    };

    //hook them into proto
    Object.keys(methods).forEach(k => {
      SpaceTime.prototype[k] = methods[k];
    });
  };

  const addMethods = SpaceTime => {
    const methods = {
      i18n: function (data) {
        //change the day names
        if (isObject(data.days)) {
          set$4(data.days);
        }
        //change the month names
        if (isObject(data.months)) {
          set$5(data.months);
        }

        //change the display style of the month / day names
        if (isBoolean(data.useTitleCase)) {
          set$3(data.useTitleCase);
        }

        //change am and pm strings
        if (isObject(data.ampm)) {
          set(data.ampm);
        }

        //change distance strings
        if(isObject(data.distance)){
          set$1(data.distance);
        }

        //change units strings
        if(isObject(data.units)){
          set$2(data.units);
        }

        return this
      }
    };

    //hook them into proto
    Object.keys(methods).forEach(k => {
      SpaceTime.prototype[k] = methods[k];
    });
  };

  let timezones = all;
  // fake timezone-support, for fakers (es5 class)
  const SpaceTime = function (input, tz, options = {}) {
    // the holy moment
    this.epoch = null;
    // the shift for the given timezone
    this.tz = lookupTz(tz, timezones);
    // whether to output warnings to console
    this.silent = typeof options.silent !== 'undefined' ? options.silent : true;
    // favour british interpretation of 02/02/2018, etc
    this.british = options.dmy || options.british;

    // does the week start on sunday, or monday:
    this._weekStart = 1; // default to monday
    if (options.weekStart !== undefined) {
      this._weekStart = options.weekStart;
    }
    // the reference today date object, (for testing)
    this._today = {};
    if (options.today !== undefined) {
      this._today = options.today;
    }
    // dunno if this is a good idea, or not
    // Object.defineProperty(this, 'parsers', {
    //   enumerable: false,
    //   writable: true,
    //   value: parsers
    // })
    // add getter/setters
    Object.defineProperty(this, 'd', {
      // return a js date object
      get: function () {
        let offset = quickOffset(this);
        // every computer is somewhere- get this computer's built-in offset
        let bias = new Date(this.epoch).getTimezoneOffset() || 0;
        // movement
        let shift = bias + (offset * 60); //in minutes
        shift = shift * 60 * 1000; //in ms
        // remove this computer's offset
        let epoch = this.epoch + shift;
        let d = new Date(epoch);
        return d
      }
    });
    // add this data on the object, to allow adding new timezones
    Object.defineProperty(this, 'timezones', {
      get: () => timezones,
      set: (obj) => {
        timezones = obj;
        return obj
      }
    });
    // parse the various formats
    let tmp = parseInput(this, input);
    this.epoch = tmp.epoch;
    if (tmp.tz) {
      this.tz = tmp.tz;
    }
  };

  // (add instance methods to prototype)
  Object.keys(methods$4).forEach((k) => {
    SpaceTime.prototype[k] = methods$4[k];
  });

  // ¯\_(ツ)_/¯
  SpaceTime.prototype.clone = function () {
    return new SpaceTime(this.epoch, this.tz, {
      silent: this.silent,
      weekStart: this._weekStart,
      today: this._today,
      parsers: this.parsers
    })
  };

  /**
   * @deprecated use toNativeDate()
   * @returns native date object at the same epoch
   */
  SpaceTime.prototype.toLocalDate = function () {
    return this.toNativeDate()
  };

  /**
   * @returns native date object at the same epoch
   */
  SpaceTime.prototype.toNativeDate = function () {
    return new Date(this.epoch)
  };

  // append more methods
  addMethods$4(SpaceTime);
  addMethods$3(SpaceTime);
  addMethods$2(SpaceTime);
  addMethods$1(SpaceTime);
  addMethods(SpaceTime);

  // const timezones = require('../data');

  const whereIts = (a, b) => {
    let start = new SpaceTime(null);
    let end = new SpaceTime(null);
    start = start.time(a);
    //if b is undefined, use as 'within one hour'
    if (b) {
      end = end.time(b);
    } else {
      end = start.add(59, 'minutes');
    }

    let startHour = start.hour();
    let endHour = end.hour();
    let tzs = Object.keys(start.timezones).filter((tz) => {
      if (tz.indexOf('/') === -1) {
        return false
      }
      let m = new SpaceTime(null, tz);
      let hour = m.hour();
      //do 'calendar-compare' not real-time-compare
      if (hour >= startHour && hour <= endHour) {
        //test minutes too, if applicable
        if (hour === startHour && m.minute() < start.minute()) {
          return false
        }
        if (hour === endHour && m.minute() > end.minute()) {
          return false
        }
        return true
      }
      return false
    });
    return tzs
  };

  var version = '7.10.0';

  const main = (input, tz, options) => new SpaceTime(input, tz, options);

  // set all properties of a given 'today' object
  const setToday = function (s) {
    let today = s._today || {};
    Object.keys(today).forEach((k) => {
      s = s[k](today[k]);
    });
    return s
  };

  //some helper functions on the main method
  main.now = (tz, options) => {
    let s = new SpaceTime(new Date().getTime(), tz, options);
    s = setToday(s);
    return s
  };
  main.today = (tz, options) => {
    let s = new SpaceTime(new Date().getTime(), tz, options);
    s = setToday(s);
    return s.startOf('day')
  };
  main.tomorrow = (tz, options) => {
    let s = new SpaceTime(new Date().getTime(), tz, options);
    s = setToday(s);
    return s.add(1, 'day').startOf('day')
  };
  main.yesterday = (tz, options) => {
    let s = new SpaceTime(new Date().getTime(), tz, options);
    s = setToday(s);
    return s.subtract(1, 'day').startOf('day')
  };
  main.fromUnixSeconds = (secs, tz, options) => {
    return new SpaceTime(secs * 1000, tz, options)
  };

  main.extend = function (obj = {}) {
    Object.keys(obj).forEach((k) => {
      SpaceTime.prototype[k] = obj[k];
    });
    return this
  };
  main.timezones = function () {
    let s = new SpaceTime();
    return s.timezones
  };
  main.max = function (tz, options) {
    let s = new SpaceTime(null, tz, options);
    s.epoch = 8640000000000000;
    return s
  };
  main.min = function (tz, options) {
    let s = new SpaceTime(null, tz, options);
    s.epoch = -864e13;
    return s
  };

  //find tz by time
  main.whereIts = whereIts;
  main.version = version;

  //aliases:
  main.plugin = main.extend;

  return main;

}));
