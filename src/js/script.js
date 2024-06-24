const { Client, Databases, ID, Query } = Appwrite;

class Card {
    constructor({ text, container_id }) {
        this.container_id = container_id;
        this.element = `
            <div class="col-sm-6 m-2">
                <div class="card">
                    <div class="card-body justify-content-center">
                        <img src="./src/assets/anonimo.svg" alt="Imagem de anonimo" class="img-fluid pb-2" style="max-width:40px;">
                        <p class="card-text">
                            ${text}
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    _returnCardGrid() {
        return document.querySelector('#' + this.container_id);
    }

    appendNewCard() {
        const container = this._returnCardGrid();
        const actualCards = container.innerHTML;

        container.innerHTML = actualCards + this.element;
    }
}

class MessageSystem {
    constructor({ PROJECT_ID, COLLECTION_ID, DATABASE_ID }) {
        this.PROJECT_ID = PROJECT_ID;
        this.COLLECTION_ID = COLLECTION_ID;
        this.DATABASE_ID = DATABASE_ID;

        this._client = new Client();
        this._client
            .setEndpoint('https://cloud.appwrite.io/v1')
            .setProject(this.PROJECT_ID);

        this._databases = new Databases(this._client);
    }

    _getMessageFromInput() { 
        console.log("_getMessageFromInput() executou certo");
        return document.querySelector("#input-message");
    };

    _checkValueValidation({ value }) {
        const palavras = value.split(' ');

        if (value !== '' && value.length >= 20 && palavras.length > 5) {
            return true;
        } else {
            console.log('Validation in _checkValueValidation({ value }): fail')
            return false;
        }
    }

    async _createDocumentInAppwrite({ databases, DATABASE_ID, COLLECTION_ID, value }) {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    message: value,
                }
            );

            return response;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async _listDocumentsFromAppwrite({ databases, DATABASE_ID, COLLECTION_ID }) {
        const listOfDocument = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
        );

        return listOfDocument;
    }

    async sendMessageToDB() {
        let response;

        try {
            const input = this._getMessageFromInput();
            const value = input.value;

            const validation_of_value = this._checkValueValidation({value});

            if (validation_of_value) {
                response = await this._createDocumentInAppwrite({
                    databases: this._databases,
                    COLLECTION_ID: this.COLLECTION_ID,
                    DATABASE_ID: this.DATABASE_ID,
                    value
                });
            } else {
                response = null;
            }

            this.listDocumentsFromDB();

            console.log('Mensagem enviada!!');
        } catch (error) {
            console.log(error)
        }
    }

    async listDocumentsFromDB() {
        document.querySelector('#card-grid').innerHTML = '';

        const listOfDocuments = await this._listDocumentsFromAppwrite({
            databases: this._databases, 
            COLLECTION_ID: this.COLLECTION_ID,
            DATABASE_ID: this.DATABASE_ID,
        })

        listOfDocuments.documents.forEach(element => {
            const card_object = new Card({
                container_id: 'card-grid',
                text: element.message,
            });
            card_object.appendNewCard();
        });
    }
}

var message_system = new MessageSystem({
    PROJECT_ID: '6644a15b000c78641b71',
    DATABASE_ID: '6644a1c30004f9ad9e6c',
    COLLECTION_ID: '6644a1f1001cf7aeb8ec',
});



function onClickSend() {
    message_system.sendMessageToDB();
}

function onLoad() {
    message_system.listDocumentsFromDB();
}

