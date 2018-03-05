export const createFoundation = i18n => {
  const Foundation = `
    # ${i18n.t`The lowest load-bearing part of a dwelling`}
    type Foundation @cacheControl(maxAge: 90) {
      # ${i18n.t`The type of foundation (en)`}
      foundationTypeEnglish: I18NString
      # ${i18n.t`The type of foundation (fr)`}
      foundationTypeFrench: I18NString
      # ${i18n.t`A descriptive label for the foundation`}
      label: I18NString
      # ${i18n.t`The type of configuration for the foundation`}
      configurationType: I18NString
      # ${i18n.t`The material used in the construction of this foundation (en)`}
      materialEnglish: I18NString
      # ${i18n.t`The material used in the construction of this foundation (fr)`}
      materialFrench: I18NString
      # ${i18n.t`The details of the floors associated with this foundation`}
      floors: [FoundationFloor]
      # ${i18n.t`The details of the walls associated with this foundation`}
      walls: [FoundationWall]
      # ${i18n.t`The details of the foundationn header`}
      header: Header
    }
  `
  return Foundation
}