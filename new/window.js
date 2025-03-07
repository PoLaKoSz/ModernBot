class createGrepoWindow {
    constructor({ id, title, size, tabs, start_tab, minimizable = true }) {
        this.minimizable = minimizable;
        this.width = size[0];
        this.height = size[1];
        this.title = title;
        this.id = id;
        this.tabs = tabs;
        this.start_tab = start_tab;

        /* Private methods */
        const createWindowType = (name, title, width, height, minimizable) => {
            function WndHandler(wndhandle) {
                this.wnd = wndhandle;
            }
            Function.prototype.inherits.call(WndHandler, uw.WndHandlerDefault);
            WndHandler.prototype.getDefaultWindowOptions = function () {
                return {
                    position: ['center', 'center', 100, 100],
                    width: width,
                    height: height,
                    minimizable: minimizable,
                    title: title,
                };
            };
            uw.GPWindowMgr.addWndType(name, `${name}_75624`, WndHandler, 1);
        };

        const getTabById = (id) => {
            return this.tabs.filter((tab) => tab.id === id)[0];
        };

        this.activate = function () {
            createWindowType(this.id, this.title, this.width, this.height, this.minimizable); //
            uw.$(
                `<style id="${this.id}_custom_window_style">
                 #${this.id} .tab_icon { left: 23px;}
                 #${this.id} {top: -36px; right: 95px;}
                 #${this.id} .submenu_link {color: #000;}
                 #${this.id} .submenu_link:hover {text-decoration: none;}
                 #${this.id} li { float:left; min-width: 60px; }
                 </style>
                `,
            ).appendTo('head');
        };

        this.deactivate = function () {
            if (uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`])) {
                uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`]).close();
            }
            uw.$(`#${this.id}_custom_window_style`).remove();
        };

        /* open the window */
        this.openWindow = function () {
            let wn = uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`]);

            /* if open is called but window it's alreay open minimized, maximize that */
            if (wn) {
                if (wn.isMinimized()) {
                    wn.maximizeWindow();
                }
                return;
            }

            let content = `<ul id="${this.id}" class="menu_inner"></ul><div id="${this.id}_content"> </div>`;
            uw.Layout.wnd.Create(uw.GPWindowMgr[`TYPE_${this.id}`]).setContent(content);
            /* Add and reder tabs */
            console.log(this.tabs);
            this.tabs.forEach((e) => {
                let html = `
                    <li><a id="${e.id}" class="submenu_link" href="#"><span class="left"><span class="right"><span class="middle">
                    <span class="tab_label"> ${e.title} </span>
                    </span></span></span></a></li>
                `;
                uw.$(html).appendTo(`#${this.id}`);
            });

            /* Add events to tabs */
            let tabs = '';
            this.tabs.forEach((e) => {
                tabs += `#${this.id} #${e.id}, `;
            });
            tabs = tabs.slice(0, -2);
            let self = this;
            uw.$(tabs).click(function () {
                self.renderTab(this.id);
            });
            /* render default tab*/
            this.renderTab(this.tabs[this.start_tab].id);
        };

        this.closeWindow = function () {
            uw.Layout.wnd.getOpenFirst(uw.GPWindowMgr[`TYPE_${this.id}`]).close();
        };

        /* Handle active tab */
        this.renderTab = function (id) {
            let tab = getTabById(id);
            uw.$(`#${this.id}_content`).html(getTabById(id).render());
            uw.$(`#${this.id} .active`).removeClass('active');
            uw.$(`#${id}`).addClass('active');
            getTabById(id).afterRender ? getTabById(id).afterRender() : '';
        };
    }
}
