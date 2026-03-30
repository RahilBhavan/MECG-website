import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEn from "@/src/locales/en/common.json";

void i18n.use(initReactI18next).init({
	lng: "en",
	fallbackLng: "en",
	resources: {
		en: { common: commonEn },
	},
	defaultNS: "common",
	ns: ["common"],
	interpolation: { escapeValue: false },
});

function syncDocumentLang(lng: string) {
	if (typeof document !== "undefined") {
		document.documentElement.lang = lng;
	}
}
syncDocumentLang(i18n.language);
i18n.on("languageChanged", syncDocumentLang);

export default i18n;
