export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingData {
    level: HeadingLevel;
    title: string;
    subtitle?: string;
    anchor?: string;
}

interface LegacyHeadingData {
    title?: unknown;
    subtitle?: unknown;
}

export const HEADING_BRICK_TYPE = 'heading';
export const HEADING_BRICK_VERSION = 3;

function normalizeRequiredText(value: string, label: string): string {
    const normalized = value.trim();

    if (!normalized) {
        throw new TypeError(`${label} is required.`);
    }

    return normalized;
}

function normalizeOptionalText(value?: string): string | undefined {
    const normalized = (value || '').trim();
    return normalized || undefined;
}

export function normalizeHeadingData(data: HeadingData): HeadingData {
    if (![1, 2, 3, 4, 5, 6].includes(data.level)) {
        throw new TypeError('Heading level must be between 1 and 6.');
    }

    const subtitle = normalizeOptionalText(data.subtitle);
    const anchor = normalizeOptionalText(data.anchor);

    return {
        level: data.level,
        title: normalizeRequiredText(data.title, 'Heading title'),
        ...(subtitle ? { subtitle } : {}),
        ...(anchor ? { anchor } : {}),
    };
}

export function renderHeading(data: HeadingData): HTMLElement {
    const normalized = normalizeHeadingData(data);
    const wrapper = document.createElement('div');
    const heading = document.createElement(`h${normalized.level}`);

    wrapper.classList.add('snb-brick', 'snb-heading');
    wrapper.setAttribute('data-snb-brick', HEADING_BRICK_TYPE);
    wrapper.setAttribute('data-snb-version', String(HEADING_BRICK_VERSION));
    wrapper.setAttribute('contenteditable', 'false');

    heading.classList.add('snb-heading__title');
    heading.textContent = normalized.title;

    if (normalized.anchor) {
        heading.id = normalized.anchor;
    }

    wrapper.appendChild(heading);

    if (normalized.subtitle) {
        const subtitle = document.createElement('p');
        subtitle.classList.add('snb-heading__subtitle');
        subtitle.textContent = normalized.subtitle;
        wrapper.appendChild(subtitle);
    }

    return wrapper;
}

export function parseHeading(element: Element): HeadingData | null {
    if (element.getAttribute('data-snb-brick') !== HEADING_BRICK_TYPE) {
        return null;
    }

    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');

    if (!heading) {
        return null;
    }

    const level = Number(heading.tagName.substring(1)) as HeadingLevel;
    const title = heading.textContent || '';
    const subtitle = element.querySelector('.snb-heading__subtitle')?.textContent || undefined;
    const anchor = heading.getAttribute('id') || undefined;

    try {
        return normalizeHeadingData({
            level,
            title,
            ...(subtitle ? { subtitle } : {}),
            ...(anchor ? { anchor } : {}),
        });
    } catch (_error) {
        return null;
    }
}

export function parseLegacyHeading(element: Element): HeadingData | null {
    const rawData = element.getAttribute('data-brickdata');
    const heading = element.querySelector('h1.snb-heading-title');

    if (!rawData || !heading) {
        return null;
    }

    try {
        const legacy = JSON.parse(rawData) as LegacyHeadingData;
        const subtitleElement = heading.querySelector('span');
        const titleFromMarkup = Array.from(heading.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent || '')
            .join(' ')
            .trim();
        const title = typeof legacy.title === 'string' ? legacy.title : titleFromMarkup;
        const subtitle = typeof legacy.subtitle === 'string'
            ? legacy.subtitle
            : subtitleElement?.textContent || undefined;

        return normalizeHeadingData({
            level: 1,
            title,
            ...(subtitle ? { subtitle } : {}),
        });
    } catch (_error) {
        return null;
    }
}

export function migrateLegacyHeading(element: Element): HTMLElement | null {
    const data = parseLegacyHeading(element);
    return data ? renderHeading(data) : null;
}
