import CookieBanner from '@ircsignpost/signpost-base/dist/src/cookie-banner';
import { MenuOverlayItem } from '@ircsignpost/signpost-base/dist/src/menu-overlay';
import {
  default as DefaultSearchResultsPage,
  SearchResultsPageStrings,
} from '@ircsignpost/signpost-base/dist/src/search-results-page';
import { ZendeskCategory } from '@ircsignpost/signpost-base/dist/src/zendesk';
import { GetStaticProps } from 'next';

import {
  CATEGORIES_TO_HIDE,
  CATEGORY_ICON_NAMES,
  GOOGLE_ANALYTICS_IDS,
  REVALIDATION_TIMEOUT_SECONDS,
  SEARCH_BAR_INDEX,
  SEARCH_RESULTS_PAGE_INDEX,
  SITE_TITLE,
  ZENDESK_AUTH_HEADER,
} from '../lib/constants';
import {
  LOCALES,
  Locale,
  getLocaleFromCode,
  getZendeskLocaleId,
} from '../lib/locale';
import { getHeaderLogoProps } from '../lib/logo';
import { getMenuItems } from '../lib/menu';
import {
  COMMON_DYNAMIC_CONTENT_PLACEHOLDERS,
  SEARCH_RESULTS_PLACEHOLDERS,
  populateMenuOverlayStrings,
  populateSearchResultsPageStrings,
} from '../lib/translations';
import { getZendeskUrl } from '../lib/url';
// TODO: import methods from '@ircsignpost/signpost-base/dist/src/zendesk' instead.
import {
  getCategories,
  getTranslationsFromDynamicContent,
} from '../lib/zendesk-fake';

interface SearchResultsPageProps {
  currentLocale: Locale;
  strings: SearchResultsPageStrings;
  // A list of |MenuOverlayItem|s to be displayed in the header and side menu.
  menuOverlayItems: MenuOverlayItem[];
  // Page title.
  title: string;
}

export default function SearchResultsPage({
  currentLocale,
  strings,
  menuOverlayItems,
  title,
}: SearchResultsPageProps) {
  return (
    <DefaultSearchResultsPage
      currentLocale={currentLocale}
      locales={LOCALES}
      pageTitle={title}
      articleSearchResultsIndex={SEARCH_RESULTS_PAGE_INDEX}
      searcResultsFilters={{ categoriesToHide: CATEGORIES_TO_HIDE }}
      searchBarIndex={SEARCH_BAR_INDEX}
      menuOverlayItems={menuOverlayItems}
      headerLogoProps={getHeaderLogoProps(currentLocale)}
      strings={strings}
      cookieBanner={
        <CookieBanner
          strings={strings.cookieBannerStrings}
          googleAnalyticsIds={GOOGLE_ANALYTICS_IDS}
        />
      }
    />
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale: Locale = getLocaleFromCode(locale ?? 'en-us');

  let dynamicContent = await getTranslationsFromDynamicContent(
    getZendeskLocaleId(currentLocale),
    COMMON_DYNAMIC_CONTENT_PLACEHOLDERS.concat(SEARCH_RESULTS_PLACEHOLDERS),
    getZendeskUrl(),
    ZENDESK_AUTH_HEADER
  );

  let categories: ZendeskCategory[] = await getCategories(
    currentLocale,
    getZendeskUrl()
  );
  categories = categories.filter((c) => !CATEGORIES_TO_HIDE.includes(c.id));
  categories.forEach((c) => (c.icon = CATEGORY_ICON_NAMES[c.id]));

  const menuOverlayItems = getMenuItems(
    populateMenuOverlayStrings(dynamicContent),
    categories
  );

  const strings = populateSearchResultsPageStrings(dynamicContent);

  return {
    props: {
      currentLocale,
      strings,
      menuOverlayItems,
      title: SITE_TITLE,
      revalidate: REVALIDATION_TIMEOUT_SECONDS,
    },
  };
};