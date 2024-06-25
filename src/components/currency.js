export const currencyByCountry = (country, t) => {    //Ország alapján a pénznem kiválasztása
    switch (country) {
        case "Hungary":
            return "HUF";
        case "Austria":
        case "Germany":
        case "Italy":
        case "France":
        case "Slovakia":
        case "Slovenia":
        case "Croatia":
        case "Netherlands":
        case "Belgium":
        case "Luxembourg":
        case "Spain":
        case "Portugal":
        case "Greece":
        case "Cyprus":
        case "Malta":
        case "Estonia":
        case "Latvia":
        case "Lithuania":
        case "Finland":
        case "Aland Islands":
        case "Ireland":
        case "Andorra":
        case "Monaco":
        case "San Marino":
        case "Vatican City":
        case "Montenegro":
        case "Kosovo":
            return "EUR";
        case "United Kingdom":
            return "GBP";
        case "Czech Republic":
            return "CZK";
        case "Poland":
            return "PLN";
        case "Romania":
            return "RON";
        case "Bulgaria":
            return "BGN";
        case "Denmark":
            return "DKK";
        case "Sweden":
            return "SEK";
        case "Norway":
            return "NOK";
        case "Switzerland":
        case "Liechtenstein":
            return "CHF";
        case "Iceland":
            return "ISK";
        case "Russia":
            return "RUB";
        case "Ukraine":
            return "UAH";
        case "Belarus":
            return "BYN";
        case "Moldova":
            return "MDL";
        case "Serbia":
            return "RSD";
        case "Bosnia and Herzegovina":
            return "BAM";
        case "Albania":
            return "ALL";
        case "North Macedonia":
            return "MKD";
        case "Turkey":
            return "TRY";
        case "Georgia":
            return "GEL";
        case "Armenia":
            return "AMD";
        case "Azerbaijan":
            return "AZN";
        case "Kazakhstan":
            return "KZT";
            case "Faroe Islands":
            return "DKK";
        default:
            return t('localcurrency');
    };
};