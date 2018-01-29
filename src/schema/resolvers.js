import Longitude from './types/Longitude'
import Latitude from './types/Latitude'
import PostalCode from './types/PostalCode'
import ForwardSortationArea from './types/ForwardSortationArea'
import { GraphQLError } from 'graphql'
import { comparators, hasMoreThanOneComparator } from '../utilities'

const resolvers = {
  Longitude,
  Latitude,
  PostalCode,
  ForwardSortationArea,
  Query: {
    evaluationsFor: async (root, { account, postalCode }, { client }) => {
      let cursor = await client.find({
        $query: { HOUSE_ID: account, MAIL_PCODE: postalCode },
        $orderby: { CREATION_DATE: -1 },
      })

      let results = await cursor.toArray()
      // Merge the results into a single object
      // representing the sum of all evaluations
      return Object.assign({}, ...results)
    },
    evaluations: async (root, { filter, withinPolygon }, { client }) => {
      if (hasMoreThanOneComparator(filter)) {
        return new GraphQLError(
          `You can only use ${Object.keys(comparators)} one at a time`,
        )
      }
      let coordinates = withinPolygon.map(el => [el.lng, el.lat])
      let query = {
        $and: [
          {
            'location.coordinates': {
              $geoWithin: {
                $geometry: {
                  type: 'Polygon',
                  coordinates: [coordinates],
                },
              },
            },
          },
        ],
      }

      // { field: 'yearBuilt', gt: '1990' }
      if (filter) {
        if (filter.gt) {
          query['$and'].push({
            [filter.field]: { [comparators.gt]: parseInt(filter.gt) },
          })
        }
      }

      let cursor = await client.find(query)

      let results = await cursor.toArray()
      return results
    },
    evaluationsInFSA: async (
      root,
      { filter, forwardSortationArea },
      { client },
    ) => {
      if (hasMoreThanOneComparator(filter)) {
        return new GraphQLError(
          `You can only use ${Object.keys(comparators)} one at a time`,
        )
      }
      let query = {
        $and: [
          {
            MAIL_PCODE: {
              $regex: new RegExp(`^${forwardSortationArea}`), // eslint-disable-line security/detect-non-literal-regexp
            },
          },
        ],
      }

      // { field: 'yearBuilt', gt: '1990' }
      if (filter) {
        if (filter.gt) {
          query['$and'].push({
            [filter.field]: { [comparators.gt]: parseInt(filter.gt) },
          })
        }
      }

      let cursor = await client.find(query)

      let results = await cursor.toArray()
      return results
    },
  },
  Evaluation: {
    yearBuilt: root => root.YEARBUILT,
    evalId: root => root.EVAL_ID,
    idNumber: root => root.IDNUMBER,
    partner: root => root.PARTNER,
    evaluator: root => root.EVALUATOR,
    previousFileId: root => root.PREVIOUSFILEID,
    status: root => root.STATUS,
    creationDate: root => root.CREATIONDATE,
    modificationDate: root => root.MODIFICATIONDATE,
    builder: root => root.BUILDER,
    houseRegion: root => root.HOUSEREGION,
    weatherLocation: root => root.WEATHERLOC,
    entryBy: root => root.ENTRYBY,
    clientCity: root => root.CLIENTCITY,
    clientAddress: root => root.CLIENTADDR,
    clientPostalCode: root => root.CLIENTPCODE,
    clientName: root => root.CLIENTNAME,
    telephoneNumber: root => root.TELEPHONE,
    mailingAddress: root => root.MAIL_ADDR,
    mailingAddressCity: root => root.MAIL_CITY,
    mailingAddressRegion: root => root.MAIL_REGION,
    mailingAddressPostalCode: root => root.MAIL_PCODE,
    taxNumber: root => root.TAXNUMBER,
    info1: root => root.INFO1,
    info2: root => root.INFO2,
    info3: root => root.INFO3,
    info4: root => root.INFO4,
    info5: root => root.INFO5,
    info6: root => root.INFO6,
    info7: root => root.INFO7,
    info8: root => root.INFO8,
    info9: root => root.INFO9,
    info10: root => root.INFO10,
    floorArea: root => root.FLOORAREA,
    footPrint: root => root.FOOTPRINT,
    furnaceType: root => root.FURNACETYPE,
    furnaceSteadyStateEfficiency: root => root.FURSSEFF,
    furnaceFuel: root => root.FURNACEFUEL,
    heatPumpSupplySource: root => root.HPSOURCE,
    heatPumpCoeffiecientOfPerformance: root => root.COP,
    hotWaterEquipmentType: root => root.PDHWTYPE,
    hotWaterEquipmentEfficiency: root => root.PDHWEF,
    hotWaterEquipmentFuelType: root => root.PDHWFUEL,
    hotWaterHeatPumpSystemType: root => root.DHWHPTYPE,
    hotWaterHeatPumpSystemCoefficienctOfPerformance: root => root.DHWHPCOP,
    csiaRating: root => root.CSIA,
    typeOfHouse: root => root.TYPEOFHOUSE,
    ceilingInsulationRSIvalue: root => root.CEILINS,
    foundationWallInsulationRSIvalue: root => root.FNDWALLINS,
    mainWallInsulationRSI: root => root.MAINWALLINS,
    storeys: root => root.STOREYS,
    totalOccupants: root => root.TOTALOCCUPANTS,
    planShape: root => root.PLANSHAPE,
    basementTemperature: root => root.TBSMNT,
    mainFloorTemperature: root => root.TMAIN,
    houseVolume: root => root.HSEVOL,
    airLeakageAt50Pascals: root => root.AIR50P,
    leakageAreaAt10Pascals: root => root.LEAKAR,
    centralVentilationSystemType: root => root.CENVENTSYSTYPE,
    registration: root => root.REGISTRATION, // TODO: this needs a better name
    programName: root => root.PROGRAMNAME, // TODO: this needs a better name
    eghfElectricityConsumption: root => root.EGHFCONELEC,
    eghfGasConsumption: root => root.EGHFCONNGAS,
    eghfOilConsumption: root => root.EGHFCONOIL,
    eghfPropaneConsumption: root => root.EGHFCONPROP,
    eghfTotalEnergyConsumption: root => root.EGHFCONTOTAL,
    eghEstimatedAnnualSpaceHeatingEnergyConsumption: root =>
      root.EGHSPACEENERGY,
    eghfcostelec: root => root.EGHFCOSTELEC,
    eghfcostngas: root => root.EGHFCOSTNGAS,
    eghfcostoil: root => root.EGHFCOSTOIL,
    eghfcostprop: root => root.EGHFCOSTPROP,
    eghfcosttotal: root => root.EGHFCOSTTOTAL,
    eghcritnatach: root => root.EGHCRITNATACH,
    eghcrittotach: root => root.EGHCRITTOTACH,
    eghhlair: root => root.EGHHLAIR,
    eghhlfound: root => root.EGHHLFOUND,
    eghhlceiling: root => root.EGHHLCEILING,
    eghhlwalls: root => root.EGHHLWALLS,
    eghhlwindoor: root => root.EGHHLWINDOOR,
    eghrating: root => root.EGHRATING,
    ugrfurnacetyp: root => root.UGRFURNACETYP,
    ugrfurnaceeff: root => root.UGRFURNACEEFF,
    ugrfurnacefuel: root => root.UGRFURNACEFUEL,
    ugrhptype: root => root.UGRHPTYPE,
    ugrhpcop: root => root.UGRHPCOP,
    ugrdhwsystype: root => root.UGRDHWSYSTYPE,
    ugrdhwsysef: root => root.UGRDHWSYSEF,
    ugrdhwsysfuel: root => root.UGRDHWSYSFUEL,
    ugrdhwhptype: root => root.UGRDHWHPTYPE,
    ugrdhwhpcop: root => root.UGRDHWHPCOP,
    ugrdhwcsia: root => root.UGRDHWCSIA,
    ugrceilins: root => root.UGRCEILINS,
    ugrfndins: root => root.UGRFNDINS,
    ugrwallins: root => root.UGRWALLINS,
    ugrfconelec: root => root.UGRFCONELEC,
    ugrfconngas: root => root.UGRFCONNGAS,
    ugrfconoil: root => root.UGRFCONOIL,
    ugrfconprop: root => root.UGRFCONPROP,
    ugrfcontotal: root => root.UGRFCONTOTAL,
    ugrfcostelec: root => root.UGRFCOSTELEC,
    ugrfcostngas: root => root.UGRFCOSTNGAS,
    ugrfcostoil: root => root.UGRFCOSTOIL,
    ugrfcostprop: root => root.UGRFCOSTPROP,
    ugrfcosttotal: root => root.UGRFCOSTTOTAL,
    ugrair50pa: root => root.UGRAIR50PA,
    ugrhlair: root => root.UGRHLAIR,
    ugrhlfound: root => root.UGRHLFOUND,
    ugrhlceiling: root => root.UGRHLCEILING,
    ugrhlwalls: root => root.UGRHLWALLS,
    ugrhlwindoor: root => root.UGRHLWINDOOR,
    ugrrating: root => root.UGRRATING,
    province: root => root.PROVINCE,
    decadebuilt: root => root.DECADEBUILT,
    location_id: root => root.LOCATION_ID,
    eghfurnaceaec: root => root.EGHFURNACEAEC,
    ugrfurnaceaec: root => root.UGRFURNACEAEC,
    eghdeshtloss: root => root.EGHDESHTLOSS,
    ugrdeshtloss: root => root.UGRDESHTLOSS,
    eghfurseaeff: root => root.EGHFURSEAEFF,
    ugrfurseaeff: root => root.UGRFURSEAEFF,
    uceventsystype: root => root.UCEVENTSYSTYPE,
    ugrcritnatach: root => root.UGRCRITNATACH,
    eghhlexposedflr: root => root.EGHHLEXPOSEDFLR,
    eghinexposedflr: root => root.EGHINEXPOSEDFLR,
    ugrinexposedflr: root => root.UGRINEXPOSEDFLR,
    ugrhlexposedflr: root => root.UGRHLEXPOSEDFLR,
    ugrcrittotach: root => root.UGRCRITTOTACH,
    ugrfurseaseff: root => root.UGRFURSEASEFF,
    eghfurseaseff: root => root.EGHFURSEASEFF,
    batch_number: root => root.BATCH_NUMBER,
    payable: root => root.PAYABLE,
    eghfconwood: root => root.EGHFCONWOOD,
    eghfcostwood: root => root.EGHFCOSTWOOD,
    ugrfconwood: root => root.UGRFCONWOOD,
    ugrfcostwood: root => root.UGRFCOSTWOOD,
    otc: root => root.OTC,
    vermiculite: root => root.VERMICULITE,
    ponywallexists: root => root.PONYWALLEXISTS,
    basementfloorar: root => root.BASEMENTFLOORAR,
    walkoutfloorar: root => root.WALKOUTFLOORAR,
    crawlspfloorar: root => root.CRAWLSPFLOORAR,
    slabfloorar: root => root.SLABFLOORAR,
    blowerdoortest: root => root.BLOWERDOORTEST,
    fireplacedamp1: root => root.FIREPLACEDAMP1,
    fireplacedamp2: root => root.FIREPLACEDAMP2,
    heatsyssizeop: root => root.HEATSYSSIZEOP,
    totalventsupply: root => root.TOTALVENTSUPPLY,
    totalventexh: root => root.TOTALVENTEXH,
    ugrtotalventsup: root => root.UGRTOTALVENTSUP,
    ugrtotalventexh: root => root.UGRTOTALVENTEXH,
    credit_pv: root => root.CREDIT_PV,
    credit_wind: root => root.CREDIT_WIND,
    ugrcredit_pv: root => root.UGRCREDIT_PV,
    ugrcredit_wind: root => root.UGRCREDIT_WIND,
    credit_thermst: root => root.CREDIT_THERMST,
    credit_vent: root => root.CREDIT_VENT,
    credit_garage: root => root.CREDIT_GARAGE,
    credit_lighting: root => root.CREDIT_LIGHTING,
    credit_egh: root => root.CREDIT_EGH,
    credit_oth1oth2: root => root.CREDIT_OTH1OTH2,
    windowcode: root => root.WINDOWCODE,
    ugrwindowcode: root => root.UGRWINDOWCODE,
    hrveff0c: root => root.HRVEFF0C,
    unitsmurbs: root => root.UNITSMURBS,
    visitedunits: root => root.VISITEDUNITS,
    baseloadsmurb: root => root.BASELOADSMURB,
    murbhtsystemdis: root => root.MURBHTSYSTEMDIS,
    indfurnacetype: root => root.INDFURNACETYPE,
    indfursseff: root => root.INDFURSSEFF,
    indfurnacefuel: root => root.INDFURNACEFUEL,
    ugrindfurnacetp: root => root.UGRINDFURNACETP,
    ugrindfursseff: root => root.UGRINDFURSSEFF,
    ugrindfurnacefu: root => root.UGRINDFURNACEFU,
    sharedata: root => root.SHAREDATA,
    estar: root => root.ESTAR,
    depressexhaust: root => root.DEPRESSEXHAUST,
    entrydate: root => root.ENTRYDATE,
    furnacemodel: root => root.FURNACEMODEL,
    buildername: root => root.BUILDERNAME,
    ownership: root => root.OWNERSHIP,
    eghheatfconse: root => root.EGHHEATFCONSE,
    eghheatfconsg: root => root.EGHHEATFCONSG,
    eghheatfconso: root => root.EGHHEATFCONSO,
    eghheatfconsp: root => root.EGHHEATFCONSP,
    eghheatfconsw: root => root.EGHHEATFCONSW,
    ugrheatfconse: root => root.UGRHEATFCONSE,
    ugrheatfconsg: root => root.UGRHEATFCONSG,
    ugrheatfconso: root => root.UGRHEATFCONSO,
    ugrheatfconsp: root => root.UGRHEATFCONSP,
    ugrheatfconsw: root => root.UGRHEATFCONSW,
    furdcmotor: root => root.FURDCMOTOR,
    ugrfurdcmotor: root => root.UGRFURDCMOTOR,
    hpestar: root => root.HPESTAR,
    ugrhpestar: root => root.UGRHPESTAR,
    nelecthermos: root => root.NELECTHERMOS,
    ugrnelecthermos: root => root.UGRNELECTHERMOS,
    epacsa: root => root.EPACSA,
    ugrepacsa: root => root.UGREPACSA,
    supphtgtype1: root => root.SUPPHTGTYPE1,
    supphtgtype2: root => root.SUPPHTGTYPE2,
    supphtgfuel1: root => root.SUPPHTGFUEL1,
    supphtgfuel2: root => root.SUPPHTGFUEL2,
    ugrsupphtgtype1: root => root.UGRSUPPHTGTYPE1,
    ugrsupphtgtype2: root => root.UGRSUPPHTGTYPE2,
    ugrsupphtgfuel1: root => root.UGRSUPPHTGFUEL1,
    ugrsupphtgfuel2: root => root.UGRSUPPHTGFUEL2,
    epacsasupphtg1: root => root.EPACSASUPPHTG1,
    epacsasupphtg2: root => root.EPACSASUPPHTG2,
    uepacsasupphtg1: root => root.UEPACSASUPPHTG1,
    uepacsasupphtg2: root => root.UEPACSASUPPHTG2,
    hviequip: root => root.HVIEQUIP,
    ugrhviequip: root => root.UGRHVIEQUIP,
    aircondtype: root => root.AIRCONDTYPE,
    ugraircondtype: root => root.UGRAIRCONDTYPE,
    aircop: root => root.AIRCOP,
    ugraircop: root => root.UGRAIRCOP,
    accentestar: root => root.ACCENTESTAR,
    ugraccentestar: root => root.UGRACCENTESTAR,
    acwindestar: root => root.ACWINDESTAR,
    ugracwindestar: root => root.UGRACWINDESTAR,
    fndhdr: root => root.FNDHDR,
    ugrfndhdr: root => root.UGRFNDHDR,
    numwindows: root => root.NUMWINDOWS,
    numwinestar: root => root.NUMWINESTAR,
    numdoors: root => root.NUMDOORS,
    ugrnumwinestar: root => root.UGRNUMWINESTAR,
    numdoorestar: root => root.NUMDOORESTAR,
    ugrnumdoorestar: root => root.UGRNUMDOORESTAR,
    acwindnum: root => root.ACWINDNUM,
    ugracwindnum: root => root.UGRACWINDNUM,
    heatafue: root => root.HEATAFUE,
    ugrheatafue: root => root.UGRHEATAFUE,
    ceilingtype: root => root.CEILINGTYPE,
    ugrceilingtype: root => root.UGRCEILINGTYPE,
    atticceilingdef: root => root.ATTICCEILINGDEF,
    uattceilingdef: root => root.UATTCEILINGDEF,
    caflaceilingdef: root => root.CAFLACEILINGDEF,
    ucaflceilingdef: root => root.UCAFLCEILINGDEF,
    fndtype: root => root.FNDTYPE,
    ugrfndtype: root => root.UGRFNDTYPE,
    fnddef: root => root.FNDDEF,
    ugrfnddef: root => root.UGRFNDDEF,
    walldef: root => root.WALLDEF,
    ugrwalldef: root => root.UGRWALLDEF,
    eincentive: root => root.EINCENTIVE,
    lftoilets: root => root.LFTOILETS,
    ulftoilets: root => root.ULFTOILETS,
    dwhrl1m: root => root.DWHRL1M,
    udwhrl1m: root => root.UDWHRL1M,
    dwhrm1m: root => root.DWHRM1M,
    udwhrm1m: root => root.UDWHRM1M,
    wthdata: root => root.WTHDATA,
    sdhwtype: root => root.SDHWTYPE,
    sdhwef: root => root.SDHWEF,
    sdhwfuel: root => root.SDHWFUEL,
    sdhwhptype: root => root.SDHWHPTYPE,
    sdhwhpcop: root => root.SDHWHPCOP,
    ugrsdhwsystype: root => root.UGRSDHWSYSTYPE,
    ugrsdhwsysef: root => root.UGRSDHWSYSEF,
    ugrsdhwsysfuel: root => root.UGRSDHWSYSFUEL,
    ugrsdhwhptype: root => root.UGRSDHWHPTYPE,
    ugrsdhwhpcop: root => root.UGRSDHWHPCOP,
    exposedfloor: root => root.EXPOSEDFLOOR,
    ugexposedfloor: root => root.UGEXPOSEDFLOOR,
    murbhsestar: root => root.MURBHSESTAR,
    murbwoodepa: root => root.MURBWOODEPA,
    murbashpestar: root => root.MURBASHPESTAR,
    murbdwhrl1m: root => root.MURBDWHRL1M,
    murbdwhrm1m: root => root.MURBDWHRM1M,
    murbhrvhvi: root => root.MURBHRVHVI,
    murbdhwins: root => root.MURBDHWINS,
    murbdhwcond: root => root.MURBDHWCOND,
    murbwoodheat: root => root.MURBWOODHEAT,
    type1capacity: root => root.TYPE1CAPACITY,
    pdhwestar: root => root.PDHWESTAR,
    ugrpdhwestar: root => root.UGRPDHWESTAR,
    sdhwestar: root => root.SDHWESTAR,
    ugrsdhwestar: root => root.UGRSDHWESTAR,
    murbdhwinses: root => root.MURBDHWINSES,
    umurbdhwinses: root => root.UMURBDHWINSES,
    murbdhwcondinses: root => root.MURBDHWCONDINSES,
    umurbdhwcondines: root => root.UMURBDHWCONDINES,
    hpcap: root => root.HPCAP,
    acmodelnumber: root => root.ACMODELNUMBER,
    mixuse: root => root.MIXUSE,
    windowcodenum: root => root.WINDOWCODENUM,
    uwindowcodenum: root => root.UWINDOWCODENUM,
    cid: root => root.CID,
    numsolsys: root => root.NUMSOLSYS,
    totcsia: root => root.TOTCSIA,
    largestcsia: root => root.LARGESTCSIA,
    sndheatsys: root => root.SNDHEATSYS,
    sndheatsysfuel: root => root.SNDHEATSYSFUEL,
    sndheatsystype: root => root.SNDHEATSYSTYPE,
    sndheatafue: root => root.SNDHEATAFUE,
    sndheatdcmotor: root => root.SNDHEATDCMOTOR,
    sndheatmanufacturer: root => root.SNDHEATMANUFACTURER,
    sndheatmodel: root => root.SNDHEATMODEL,
    sndheatestar: root => root.SNDHEATESTAR,
    ugrsndheatsys: root => root.UGRSNDHEATSYS,
    ugrsndheatsysfuel: root => root.UGRSNDHEATSYSFUEL,
    ugrsndheatsystype: root => root.UGRSNDHEATSYSTYPE,
    ugrsndheatafue: root => root.UGRSNDHEATAFUE,
    ugrsndheatdcmotor: root => root.UGRSNDHEATDCMOTOR,
    ugrsndheatmanufacturer: root => root.UGRSNDHEATMANUFACTURER,
    ugrsndheatmodel: root => root.UGRSNDHEATMODEL,
    ugrsndheatestar: root => root.UGRSNDHEATESTAR,
    numwinzoned: root => root.NUMWINZONED,
    numdoorzoned: root => root.NUMDOORZONED,
    ugrnumwinzoned: root => root.UGRNUMWINZONED,
    ugrnumdoorzoned: root => root.UGRNUMDOORZONED,
    washermanufacturer: root => root.WASHERMANUFACTURER,
    washermodel: root => root.WASHERMODEL,
    washerestar: root => root.WASHERESTAR,
    ugrwashermanufacturer: root => root.UGRWASHERMANUFACTURER,
    ugrwashermodel: root => root.UGRWASHERMODEL,
    ugrwasherestar: root => root.UGRWASHERESTAR,
    dryerfuel: root => root.DRYERFUEL,
    dryermanufacturer: root => root.DRYERMANUFACTURER,
    dryermodel: root => root.DRYERMODEL,
    ugrdryerfuel: root => root.UGRDRYERFUEL,
    ugrdryermanufacturer: root => root.UGRDRYERMANUFACTURER,
    ugrdryermodel: root => root.UGRDRYERMODEL,
    estarlights: root => root.ESTARLIGHTS,
    ugrestarlights: root => root.UGRESTARLIGHTS,
    hviestar: root => root.HVIESTAR,
    estarmurbhrvhvi: root => root.ESTARMURBHRVHVI,
    ugrhviestar: root => root.UGRHVIESTAR,
    ugrmurbhrvhvi: root => root.UGRMURBHRVHVI,
    ugrestarmurbhrvhvi: root => root.UGRESTARMURBHRVHVI,
    murbdhwstes: root => root.MURBDHWSTES,
    ugrmurbdhwstes: root => root.UGRMURBDHWSTES,
    eval_type: root => root.EVAL_TYPE,
    eid: root => root.EID,
    house_id: root => root.HOUSE_ID,
    justify: root => root.JUSTIFY,
    energuideRating: root => root.ERSRATING,
    ugrersrating: root => root.UGRERSRATING,
    ersenergyintensity: root => root.ERSENERGYINTENSITY,
    ugrersenergyintensity: root => root.UGRERSENERGYINTENSITY,
    ersghg: root => root.ERSGHG,
    ugrersghg: root => root.UGRERSGHG,
    ersrenewableprod: root => root.ERSRENEWABLEPROD,
    hocersrating: root => root.HOCERSRATING,
    hocugrersrating: root => root.HOCUGRERSRATING,
    ersrefhouserating: root => root.ERSREFHOUSERATING,
    rulesetver: root => root.RULESETVER,
    rulesettype: root => root.RULESETTYPE,
    heatedfloorarea: root => root.HEATEDFLOORAREA,
    ersrenewableelec: root => root.ERSRENEWABLEELEC,
    ersspacecoolenergy: root => root.ERSSPACECOOLENERGY,
    ersrenewablesolar: root => root.ERSRENEWABLESOLAR,
    erswaterheatingenergy: root => root.ERSWATERHEATINGENERGY,
    ersventilationenergy: root => root.ERSVENTILATIONENERGY,
    erslightapplianceenergy: root => root.ERSLIGHTAPPLIANCEENERGY,
    ersotherelecenergy: root => root.ERSOTHERELECENERGY,
    ugrersspacecoolenergy: root => root.UGRERSSPACECOOLENERGY,
    ugrerswaterheatingenergy: root => root.UGRERSWATERHEATINGENERGY,
    ugrersventilationenergy: root => root.UGRERSVENTILATIONENERGY,
    ugrerslightapplianceenergy: root => root.UGRERSLIGHTAPPLIANCEENERGY,
    ugrersotherelecenergy: root => root.UGRERSOTHERELECENERGY,
    erselecghg: root => root.ERSELECGHG,
    ersngasghg: root => root.ERSNGASGHG,
    ersoilghg: root => root.ERSOILGHG,
    erspropghg: root => root.ERSPROPGHG,
    erswoodghg: root => root.ERSWOODGHG,
    ersrenewableelecghg: root => root.ERSRENEWABLEELECGHG,
    ersrenewablesolarghg: root => root.ERSRENEWABLESOLARGHG,
    ershlwindow: root => root.ERSHLWINDOW,
    ershldoor: root => root.ERSHLDOOR,
    ugrershlwindow: root => root.UGRERSHLWINDOW,
    ugrershldoor: root => root.UGRERSHLDOOR,
    ugrspaceenergy: root => root.UGRSPACEENERGY,
    qwarn: root => root.QWARN,
    qtot: root => root.QTOT,
    dataset: root => root.DATASET,
    eidef: root => root.EIDEF,
    ugreidef: root => root.UGREIDEF,
    buildingtype: root => root.BUILDINGTYPE,
    eghfconwoodgj: root => root.EGHFCONWOODGJ,
  },
  Field: {
    yearBuilt: 'YEARBUILT',
    evalId: 'EVAL_ID',
    idNumber: 'IDNUMBER',
    partner: 'PARTNER',
    evaluator: 'EVALUATOR',
    previousFileId: 'PREVIOUSFILEID',
    status: 'STATUS',
    creationDate: 'CREATIONDATE',
    modificationDate: 'MODIFICATIONDATE',
    builder: 'BUILDER',
    houseRegion: 'HOUSEREGION',
    weatherLocation: 'WEATHERLOC',
    entryBy: 'ENTRYBY',
    clientCity: 'CLIENTCITY',
    clientAddress: 'CLIENTADDR',
    clientPostalCode: 'CLIENTPCODE',
    clientName: 'CLIENTNAME',
    telephoneNumber: 'TELEPHONE',
    mailingAddress: 'MAIL_ADDR',
    mailingAddressCity: 'MAIL_CITY',
    mailingAddressRegion: 'MAIL_REGION',
    mailingAddressPostalCode: 'MAIL_PCODE',
    taxNumber: 'TAXNUMBER',
    info1: 'INFO1',
    info2: 'INFO2',
    info3: 'INFO3',
    info4: 'INFO4',
    info5: 'INFO5',
    info6: 'INFO6',
    info7: 'INFO7',
    info8: 'INFO8',
    info9: 'INFO9',
    info10: 'INFO10',
    floorArea: 'FLOORAREA',
    footPrint: 'FOOTPRINT',
    furnaceType: 'FURNACETYPE',
    furnaceSteadyStateEfficiency: 'FURSSEFF',
    furnaceFuel: 'FURNACEFUEL',
    heatPumpSupplySource: 'HPSOURCE',
    heatPumpCoeffiecientOfPerformance: 'COP',
    hotWaterEquipmentType: 'PDHWTYPE',
    hotWaterEquipmentEfficiency: 'PDHWEF',
    hotWaterEquipmentFuelType: 'PDHWFUEL',
    hotWaterHeatPumpSystemType: 'DHWHPTYPE',
    hotWaterHeatPumpSystemCoefficienctOfPerformance: 'DHWHPCOP',
    csiaRating: 'CSIA',
    typeOfHouse: 'TYPEOFHOUSE',
    ceilingInsulationRSIvalue: 'CEILINS',
    foundationWallInsulationRSIvalue: 'FNDWALLINS',
    mainWallInsulationRSI: 'MAINWALLINS',
    storeys: 'STOREYS',
    totalOccupants: 'TOTALOCCUPANTS',
    planShape: 'PLANSHAPE',
    basementTemperature: 'TBSMNT',
    mainFloorTemperature: 'TMAIN',
    houseVolume: 'HSEVOL',
    airLeakageAt50Pascals: 'AIR50P',
    leakageAreaAt10Pascals: 'LEAKAR',
    centralVentilationSystemType: 'CENVENTSYSTYPE',
    registration: 'REGISTRATION', // TODO: this needs a better name
    programName: 'PROGRAMNAME', // TODO: this needs a better name
    eghfElectricityConsumption: 'EGHFCONELEC',
    eghfGasConsumption: 'EGHFCONNGAS',
    eghfOilConsumption: 'EGHFCONOIL',
    eghfPropaneConsumption: 'EGHFCONPROP',
    eghfTotalEnergyConsumption: 'EGHFCONTOTAL',
    eghEstimatedAnnualSpaceHeatingEnergyConsumption: root =>
      root.EGHSPACEENERGY,
    eghfcostelec: 'EGHFCOSTELEC',
    eghfcostngas: 'EGHFCOSTNGAS',
    eghfcostoil: 'EGHFCOSTOIL',
    eghfcostprop: 'EGHFCOSTPROP',
    eghfcosttotal: 'EGHFCOSTTOTAL',
    eghcritnatach: 'EGHCRITNATACH',
    eghcrittotach: 'EGHCRITTOTACH',
    eghhlair: 'EGHHLAIR',
    eghhlfound: 'EGHHLFOUND',
    eghhlceiling: 'EGHHLCEILING',
    eghhlwalls: 'EGHHLWALLS',
    eghhlwindoor: 'EGHHLWINDOOR',
    eghrating: 'EGHRATING',
    ugrfurnacetyp: 'UGRFURNACETYP',
    ugrfurnaceeff: 'UGRFURNACEEFF',
    ugrfurnacefuel: 'UGRFURNACEFUEL',
    ugrhptype: 'UGRHPTYPE',
    ugrhpcop: 'UGRHPCOP',
    ugrdhwsystype: 'UGRDHWSYSTYPE',
    ugrdhwsysef: 'UGRDHWSYSEF',
    ugrdhwsysfuel: 'UGRDHWSYSFUEL',
    ugrdhwhptype: 'UGRDHWHPTYPE',
    ugrdhwhpcop: 'UGRDHWHPCOP',
    ugrdhwcsia: 'UGRDHWCSIA',
    ugrceilins: 'UGRCEILINS',
    ugrfndins: 'UGRFNDINS',
    ugrwallins: 'UGRWALLINS',
    ugrfconelec: 'UGRFCONELEC',
    ugrfconngas: 'UGRFCONNGAS',
    ugrfconoil: 'UGRFCONOIL',
    ugrfconprop: 'UGRFCONPROP',
    ugrfcontotal: 'UGRFCONTOTAL',
    ugrfcostelec: 'UGRFCOSTELEC',
    ugrfcostngas: 'UGRFCOSTNGAS',
    ugrfcostoil: 'UGRFCOSTOIL',
    ugrfcostprop: 'UGRFCOSTPROP',
    ugrfcosttotal: 'UGRFCOSTTOTAL',
    ugrair50pa: 'UGRAIR50PA',
    ugrhlair: 'UGRHLAIR',
    ugrhlfound: 'UGRHLFOUND',
    ugrhlceiling: 'UGRHLCEILING',
    ugrhlwalls: 'UGRHLWALLS',
    ugrhlwindoor: 'UGRHLWINDOOR',
    ugrrating: 'UGRRATING',
    province: 'PROVINCE',
    decadebuilt: 'DECADEBUILT',
    location_id: 'LOCATION_ID',
    eghfurnaceaec: 'EGHFURNACEAEC',
    ugrfurnaceaec: 'UGRFURNACEAEC',
    eghdeshtloss: 'EGHDESHTLOSS',
    ugrdeshtloss: 'UGRDESHTLOSS',
    eghfurseaeff: 'EGHFURSEAEFF',
    ugrfurseaeff: 'UGRFURSEAEFF',
    uceventsystype: 'UCEVENTSYSTYPE',
    ugrcritnatach: 'UGRCRITNATACH',
    eghhlexposedflr: 'EGHHLEXPOSEDFLR',
    eghinexposedflr: 'EGHINEXPOSEDFLR',
    ugrinexposedflr: 'UGRINEXPOSEDFLR',
    ugrhlexposedflr: 'UGRHLEXPOSEDFLR',
    ugrcrittotach: 'UGRCRITTOTACH',
    ugrfurseaseff: 'UGRFURSEASEFF',
    eghfurseaseff: 'EGHFURSEASEFF',
    batch_number: 'BATCH_NUMBER',
    payable: 'PAYABLE',
    eghfconwood: 'EGHFCONWOOD',
    eghfcostwood: 'EGHFCOSTWOOD',
    ugrfconwood: 'UGRFCONWOOD',
    ugrfcostwood: 'UGRFCOSTWOOD',
    otc: 'OTC',
    vermiculite: 'VERMICULITE',
    ponywallexists: 'PONYWALLEXISTS',
    basementfloorar: 'BASEMENTFLOORAR',
    walkoutfloorar: 'WALKOUTFLOORAR',
    crawlspfloorar: 'CRAWLSPFLOORAR',
    slabfloorar: 'SLABFLOORAR',
    blowerdoortest: 'BLOWERDOORTEST',
    fireplacedamp1: 'FIREPLACEDAMP1',
    fireplacedamp2: 'FIREPLACEDAMP2',
    heatsyssizeop: 'HEATSYSSIZEOP',
    totalventsupply: 'TOTALVENTSUPPLY',
    totalventexh: 'TOTALVENTEXH',
    ugrtotalventsup: 'UGRTOTALVENTSUP',
    ugrtotalventexh: 'UGRTOTALVENTEXH',
    credit_pv: 'CREDIT_PV',
    credit_wind: 'CREDIT_WIND',
    ugrcredit_pv: 'UGRCREDIT_PV',
    ugrcredit_wind: 'UGRCREDIT_WIND',
    credit_thermst: 'CREDIT_THERMST',
    credit_vent: 'CREDIT_VENT',
    credit_garage: 'CREDIT_GARAGE',
    credit_lighting: 'CREDIT_LIGHTING',
    credit_egh: 'CREDIT_EGH',
    credit_oth1oth2: 'CREDIT_OTH1OTH2',
    windowcode: 'WINDOWCODE',
    ugrwindowcode: 'UGRWINDOWCODE',
    hrveff0c: 'HRVEFF0C',
    unitsmurbs: 'UNITSMURBS',
    visitedunits: 'VISITEDUNITS',
    baseloadsmurb: 'BASELOADSMURB',
    murbhtsystemdis: 'MURBHTSYSTEMDIS',
    indfurnacetype: 'INDFURNACETYPE',
    indfursseff: 'INDFURSSEFF',
    indfurnacefuel: 'INDFURNACEFUEL',
    ugrindfurnacetp: 'UGRINDFURNACETP',
    ugrindfursseff: 'UGRINDFURSSEFF',
    ugrindfurnacefu: 'UGRINDFURNACEFU',
    sharedata: 'SHAREDATA',
    estar: 'ESTAR',
    depressexhaust: 'DEPRESSEXHAUST',
    entrydate: 'ENTRYDATE',
    furnacemodel: 'FURNACEMODEL',
    buildername: 'BUILDERNAME',
    ownership: 'OWNERSHIP',
    eghheatfconse: 'EGHHEATFCONSE',
    eghheatfconsg: 'EGHHEATFCONSG',
    eghheatfconso: 'EGHHEATFCONSO',
    eghheatfconsp: 'EGHHEATFCONSP',
    eghheatfconsw: 'EGHHEATFCONSW',
    ugrheatfconse: 'UGRHEATFCONSE',
    ugrheatfconsg: 'UGRHEATFCONSG',
    ugrheatfconso: 'UGRHEATFCONSO',
    ugrheatfconsp: 'UGRHEATFCONSP',
    ugrheatfconsw: 'UGRHEATFCONSW',
    furdcmotor: 'FURDCMOTOR',
    ugrfurdcmotor: 'UGRFURDCMOTOR',
    hpestar: 'HPESTAR',
    ugrhpestar: 'UGRHPESTAR',
    nelecthermos: 'NELECTHERMOS',
    ugrnelecthermos: 'UGRNELECTHERMOS',
    epacsa: 'EPACSA',
    ugrepacsa: 'UGREPACSA',
    supphtgtype1: 'SUPPHTGTYPE1',
    supphtgtype2: 'SUPPHTGTYPE2',
    supphtgfuel1: 'SUPPHTGFUEL1',
    supphtgfuel2: 'SUPPHTGFUEL2',
    ugrsupphtgtype1: 'UGRSUPPHTGTYPE1',
    ugrsupphtgtype2: 'UGRSUPPHTGTYPE2',
    ugrsupphtgfuel1: 'UGRSUPPHTGFUEL1',
    ugrsupphtgfuel2: 'UGRSUPPHTGFUEL2',
    epacsasupphtg1: 'EPACSASUPPHTG1',
    epacsasupphtg2: 'EPACSASUPPHTG2',
    uepacsasupphtg1: 'UEPACSASUPPHTG1',
    uepacsasupphtg2: 'UEPACSASUPPHTG2',
    hviequip: 'HVIEQUIP',
    ugrhviequip: 'UGRHVIEQUIP',
    aircondtype: 'AIRCONDTYPE',
    ugraircondtype: 'UGRAIRCONDTYPE',
    aircop: 'AIRCOP',
    ugraircop: 'UGRAIRCOP',
    accentestar: 'ACCENTESTAR',
    ugraccentestar: 'UGRACCENTESTAR',
    acwindestar: 'ACWINDESTAR',
    ugracwindestar: 'UGRACWINDESTAR',
    fndhdr: 'FNDHDR',
    ugrfndhdr: 'UGRFNDHDR',
    numwindows: 'NUMWINDOWS',
    numwinestar: 'NUMWINESTAR',
    numdoors: 'NUMDOORS',
    ugrnumwinestar: 'UGRNUMWINESTAR',
    numdoorestar: 'NUMDOORESTAR',
    ugrnumdoorestar: 'UGRNUMDOORESTAR',
    acwindnum: 'ACWINDNUM',
    ugracwindnum: 'UGRACWINDNUM',
    heatafue: 'HEATAFUE',
    ugrheatafue: 'UGRHEATAFUE',
    ceilingtype: 'CEILINGTYPE',
    ugrceilingtype: 'UGRCEILINGTYPE',
    atticceilingdef: 'ATTICCEILINGDEF',
    uattceilingdef: 'UATTCEILINGDEF',
    caflaceilingdef: 'CAFLACEILINGDEF',
    ucaflceilingdef: 'UCAFLCEILINGDEF',
    fndtype: 'FNDTYPE',
    ugrfndtype: 'UGRFNDTYPE',
    fnddef: 'FNDDEF',
    ugrfnddef: 'UGRFNDDEF',
    walldef: 'WALLDEF',
    ugrwalldef: 'UGRWALLDEF',
    eincentive: 'EINCENTIVE',
    lftoilets: 'LFTOILETS',
    ulftoilets: 'ULFTOILETS',
    dwhrl1m: 'DWHRL1M',
    udwhrl1m: 'UDWHRL1M',
    dwhrm1m: 'DWHRM1M',
    udwhrm1m: 'UDWHRM1M',
    wthdata: 'WTHDATA',
    sdhwtype: 'SDHWTYPE',
    sdhwef: 'SDHWEF',
    sdhwfuel: 'SDHWFUEL',
    sdhwhptype: 'SDHWHPTYPE',
    sdhwhpcop: 'SDHWHPCOP',
    ugrsdhwsystype: 'UGRSDHWSYSTYPE',
    ugrsdhwsysef: 'UGRSDHWSYSEF',
    ugrsdhwsysfuel: 'UGRSDHWSYSFUEL',
    ugrsdhwhptype: 'UGRSDHWHPTYPE',
    ugrsdhwhpcop: 'UGRSDHWHPCOP',
    exposedfloor: 'EXPOSEDFLOOR',
    ugexposedfloor: 'UGEXPOSEDFLOOR',
    murbhsestar: 'MURBHSESTAR',
    murbwoodepa: 'MURBWOODEPA',
    murbashpestar: 'MURBASHPESTAR',
    murbdwhrl1m: 'MURBDWHRL1M',
    murbdwhrm1m: 'MURBDWHRM1M',
    murbhrvhvi: 'MURBHRVHVI',
    murbdhwins: 'MURBDHWINS',
    murbdhwcond: 'MURBDHWCOND',
    murbwoodheat: 'MURBWOODHEAT',
    type1capacity: 'TYPE1CAPACITY',
    pdhwestar: 'PDHWESTAR',
    ugrpdhwestar: 'UGRPDHWESTAR',
    sdhwestar: 'SDHWESTAR',
    ugrsdhwestar: 'UGRSDHWESTAR',
    murbdhwinses: 'MURBDHWINSES',
    umurbdhwinses: 'UMURBDHWINSES',
    murbdhwcondinses: 'MURBDHWCONDINSES',
    umurbdhwcondines: 'UMURBDHWCONDINES',
    hpcap: 'HPCAP',
    acmodelnumber: 'ACMODELNUMBER',
    mixuse: 'MIXUSE',
    windowcodenum: 'WINDOWCODENUM',
    uwindowcodenum: 'UWINDOWCODENUM',
    cid: 'CID',
    numsolsys: 'NUMSOLSYS',
    totcsia: 'TOTCSIA',
    largestcsia: 'LARGESTCSIA',
    sndheatsys: 'SNDHEATSYS',
    sndheatsysfuel: 'SNDHEATSYSFUEL',
    sndheatsystype: 'SNDHEATSYSTYPE',
    sndheatafue: 'SNDHEATAFUE',
    sndheatdcmotor: 'SNDHEATDCMOTOR',
    sndheatmanufacturer: 'SNDHEATMANUFACTURER',
    sndheatmodel: 'SNDHEATMODEL',
    sndheatestar: 'SNDHEATESTAR',
    ugrsndheatsys: 'UGRSNDHEATSYS',
    ugrsndheatsysfuel: 'UGRSNDHEATSYSFUEL',
    ugrsndheatsystype: 'UGRSNDHEATSYSTYPE',
    ugrsndheatafue: 'UGRSNDHEATAFUE',
    ugrsndheatdcmotor: 'UGRSNDHEATDCMOTOR',
    ugrsndheatmanufacturer: 'UGRSNDHEATMANUFACTURER',
    ugrsndheatmodel: 'UGRSNDHEATMODEL',
    ugrsndheatestar: 'UGRSNDHEATESTAR',
    numwinzoned: 'NUMWINZONED',
    numdoorzoned: 'NUMDOORZONED',
    ugrnumwinzoned: 'UGRNUMWINZONED',
    ugrnumdoorzoned: 'UGRNUMDOORZONED',
    washermanufacturer: 'WASHERMANUFACTURER',
    washermodel: 'WASHERMODEL',
    washerestar: 'WASHERESTAR',
    ugrwashermanufacturer: 'UGRWASHERMANUFACTURER',
    ugrwashermodel: 'UGRWASHERMODEL',
    ugrwasherestar: 'UGRWASHERESTAR',
    dryerfuel: 'DRYERFUEL',
    dryermanufacturer: 'DRYERMANUFACTURER',
    dryermodel: 'DRYERMODEL',
    ugrdryerfuel: 'UGRDRYERFUEL',
    ugrdryermanufacturer: 'UGRDRYERMANUFACTURER',
    ugrdryermodel: 'UGRDRYERMODEL',
    estarlights: 'ESTARLIGHTS',
    ugrestarlights: 'UGRESTARLIGHTS',
    hviestar: 'HVIESTAR',
    estarmurbhrvhvi: 'ESTARMURBHRVHVI',
    ugrhviestar: 'UGRHVIESTAR',
    ugrmurbhrvhvi: 'UGRMURBHRVHVI',
    ugrestarmurbhrvhvi: 'UGRESTARMURBHRVHVI',
    murbdhwstes: 'MURBDHWSTES',
    ugrmurbdhwstes: 'UGRMURBDHWSTES',
    eval_type: 'EVAL_TYPE',
    eid: 'EID',
    house_id: 'HOUSE_ID',
    justify: 'JUSTIFY',
    energuideRating: 'ERSRATING',
    ugrersrating: 'UGRERSRATING',
    ersenergyintensity: 'ERSENERGYINTENSITY',
    ugrersenergyintensity: 'UGRERSENERGYINTENSITY',
    ersghg: 'ERSGHG',
    ugrersghg: 'UGRERSGHG',
    ersrenewableprod: 'ERSRENEWABLEPROD',
    hocersrating: 'HOCERSRATING',
    hocugrersrating: 'HOCUGRERSRATING',
    ersrefhouserating: 'ERSREFHOUSERATING',
    rulesetver: 'RULESETVER',
    rulesettype: 'RULESETTYPE',
    heatedfloorarea: 'HEATEDFLOORAREA',
    ersrenewableelec: 'ERSRENEWABLEELEC',
    ersspacecoolenergy: 'ERSSPACECOOLENERGY',
    ersrenewablesolar: 'ERSRENEWABLESOLAR',
    erswaterheatingenergy: 'ERSWATERHEATINGENERGY',
    ersventilationenergy: 'ERSVENTILATIONENERGY',
    erslightapplianceenergy: 'ERSLIGHTAPPLIANCEENERGY',
    ersotherelecenergy: 'ERSOTHERELECENERGY',
    ugrersspacecoolenergy: 'UGRERSSPACECOOLENERGY',
    ugrerswaterheatingenergy: 'UGRERSWATERHEATINGENERGY',
    ugrersventilationenergy: 'UGRERSVENTILATIONENERGY',
    ugrerslightapplianceenergy: 'UGRERSLIGHTAPPLIANCEENERGY',
    ugrersotherelecenergy: 'UGRERSOTHERELECENERGY',
    erselecghg: 'ERSELECGHG',
    ersngasghg: 'ERSNGASGHG',
    ersoilghg: 'ERSOILGHG',
    erspropghg: 'ERSPROPGHG',
    erswoodghg: 'ERSWOODGHG',
    ersrenewableelecghg: 'ERSRENEWABLEELECGHG',
    ersrenewablesolarghg: 'ERSRENEWABLESOLARGHG',
    ershlwindow: 'ERSHLWINDOW',
    ershldoor: 'ERSHLDOOR',
    ugrershlwindow: 'UGRERSHLWINDOW',
    ugrershldoor: 'UGRERSHLDOOR',
    ugrspaceenergy: 'UGRSPACEENERGY',
    qwarn: 'QWARN',
    qtot: 'QTOT',
    dataset: 'DATASET',
    eidef: 'EIDEF',
    ugreidef: 'UGREIDEF',
    buildingtype: 'BUILDINGTYPE',
    eghfconwoodgj: 'EGHFCONWOODGJ',
  },
}

export default resolvers
