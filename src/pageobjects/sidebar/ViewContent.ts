import { SideBarView } from "./SideBarView";
import { ViewSection } from './ViewSection';
import { DefaultTreeSection } from "./tree/default/DefaultTreeSection";
import { CustomTreeSection } from "./tree/custom/CustomTreeSection";
import { ExtensionsViewSection } from "./extensions/ExtensionsViewSection";
import { PluginDecorator, IPluginDecorator, BasePage } from '../utils'
import { sideBar } from 'locators/1.61.0';

/**
 * Page object representing the view container of a side bar view
 */
export interface ViewContent extends IPluginDecorator<typeof sideBar.ViewContent> { }
@PluginDecorator(sideBar.ViewContent)
export class ViewContent extends BasePage {
    constructor(
        locators: typeof sideBar.ViewContent,
        view: SideBarView = new SideBarView(sideBar.SideBarView)
    ) {
        super(locators, locators.elem, view.elem);
    }

    /**
     * Finds whether a progress bar is active at the top of the view
     * @returns Promise resolving to true/false
     */
    async hasProgress(): Promise<boolean> {
        const hidden = await this.progress$.getAttribute('aria-hidden');
        if (hidden === 'true') {
            return false;
        }
        return true;
    }

    /**
     * Retrieves a collapsible view content section by its title
     * @param title Title of the section
     * @returns Promise resolving to ViewSection object
     */
    async getSection(title: string): Promise<ViewSection> {
        const elements = await this.section$$;
        let panel!: WebdriverIO.Element;

        for (const element of elements) {
            if (await this.sectionTitle$.getAttribute(this.locators.sectionText) === title) {
                panel = element;
                break;
            }
        }
        if (!panel) {
            throw new Error(`No section with title '${title}' found`);
        }
        return await this.createSection(panel);
    }

    /**
     * Retrieves all the collapsible view content sections
     * @returns Promise resolving to array of ViewSection objects
     */
    async getSections(): Promise<ViewSection[]> {
        const sections: ViewSection[] = [];
        const elements = await this.section$$;
        for (const element of elements) {
            let section = await this.createSection(element);
            sections.push(await section.wait());
        }
        return sections;
    }

    private async createSection(panel: WebdriverIO.Element): Promise<ViewSection> {
        let section: ViewSection = new DefaultTreeSection(panel, this);

        if (await section.elem.$(this.locators.defaultView).isExisting()) {
            return section
        }
        if (await section.elem.$(this.locators.extensionsView).isExisting()) {
            return new ExtensionsViewSection(panel, this);
        }
        
        return new CustomTreeSection(panel, this);
    }
}