class ModernStorage {
    constructor() {
        /* Try to load the data from the note */
        this.loadNote().then(e => {
            if (!e) return;
            try {
                let storage = JSON.parse(e.text);
                this.saveStorage(storage)
                this.lastUpdateTime = null;
            } catch (error) {
                console.log(error)
            }
        })

        /* Save the data before the user close the window */
        window.addEventListener("beforeunload", () => {
            if (!this.lastUpdateTime) return;
            this.saveSettingsNote()
        });

        /* After an entry it's saved start a countdown of 30 seconds */
        this.lastUpdateTime = Date.now();
        setInterval(() => {
            if (!this.lastUpdateTime) return;
            const now = Date.now();
            const timeSinceLastUpdate = now - this.lastUpdateTime;
            if (timeSinceLastUpdate > 30000) {
                this.saveSettingsNote();
                this.lastUpdateTime = null;
            }
        }, 1000);
    }

    getStorage = () => {
        const worldId = uw.Game.world_id;
        const savedValue = localStorage.getItem(`${worldId}_modernBot`);
        let storage = {};

        if (savedValue !== null && savedValue !== undefined) {
            try {
                storage = JSON.parse(savedValue);
            } catch (error) {
                console.error(`Error parsing localStorage data: ${error}`);
            }
        }

        return storage;
    }

    saveStorage = (storage) => {
        try {
            const worldId = uw.Game.world_id;
            localStorage.setItem(`${worldId}_modernBot`, JSON.stringify(storage));
            this.lastUpdateTime = Date.now();
            return true;
        } catch (error) {
            console.error(`Error saving data to localStorage: ${error}`);
            return false;
        }
    }

    save = (key, content) => {
        const storage = this.getStorage();
        storage[key] = content
        return this.saveStorage(storage);
    }

    load = (key, defaultValue = null) => {
        const storage = this.getStorage();
        const savedValue = storage[key];
        return savedValue !== undefined ? savedValue : defaultValue;
    }

    saveSettingsNote = () => {
        if (!this.note_id) return;
        const storage = this.getStorage()

        const data = {
            "model_url": `PlayerNote/${this.note_id}`,
            "action_name": "save",
            "arguments":
            {
                "id": this.note_id,
                "text": JSON.stringify(storage),
            }
        }
        uw.gpAjax.ajaxPost("frontend_bridge", "execute", data)
    };

    loadNote = () => {
        return new Promise((resolve, reject) => {
            const data = {
                "window_type": "notes",
                "tab_type": "note1",
                "known_data": {
                    "models": [],
                    "collections": [],
                }
            };
            uw.gpAjax.ajaxGet("frontend_bridge", "fetch", data, false, (...data) => {
                const playerNotes = data[0].collections.PlayerNotes.data;
                for (let model of playerNotes) {
                    if (model.d.title === "settings") {
                        this.note_id = model.d.id
                        resolve(model.d);
                    }
                }
                resolve(null);
            });
        });
    };

}