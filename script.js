// Abrir e fechar o modal
const Modal = {
    toggle() {
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
}

const Storage = {
    // Pegar as transações do local storage
    get() {
        return JSON.parse(localStorage.getItem("transaction")) || []

    },
    // Setar as transações no local storage
    set(transactions) {
        localStorage.setItem("transaction", JSON.stringify(transactions))
    }
}

// Fazer os calculos das transações
const Transaction = {
    // Armazenar os dados de transações
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },

    income() {
        // somar as entradas
        let income = 0;
        // Para cada trasação
        Transaction.all.forEach(transaction => {
            // Verificar se é positivo
            if(transaction.amount > 0) {
                // Se sim somar com entradas
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        // somar as saidas
        let expense = 0;
        // Para cada trasação
       Transaction.all.forEach(transaction => {
            // Verificar se é negativo
            if(transaction.amount < 0) {
                // Se sim somar com entradas
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        // entradas menos saidas
        return Transaction.income() + Transaction.expenses();
    }
}

// Por os dados do js no html
const DOM = {
    // Criar um container no tbody da table
    // para colocar a tr
    transactionContainer:document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        // Criando a tr
        const tr = document.createElement('tr')
        // Colocando as informações na tr
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        // Colocando a tr no container criado
        DOM.transactionContainer.appendChild(tr)
    },
    
    innerHTMLTransaction(transaction, index) {
        // Verificando qual classe css colocar no html
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        // Usando uma função criada para formatar a moeda
        const amount  = Util.formatCurrency(transaction.amount) 

        // Colocando a estrutura html no js
        //para devolvela de forma dinamica 
        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="imagem menos">
            </td>
        `
        return html
    },
    
    updateBalance() {
        // Achar os elemento pelo ID
        document
            .getElementById('incomeDisplay')
            // Atualizar a informação neles
            // e formatar a moeda
            .innerHTML = Util.formatCurrency(Transaction.income())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Util.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Util.formatCurrency(Transaction.total())
    },

    clearTransaction() {
        DOM.transactionContainer.innerHTML = ""
    }
}

// Função para formatar a moeda
const Util = {
    formatAmount(amount) {
        value = Number(amount) * 100
        return Math.round(value)
    },

    formatDate(date) {
        // Dividindo a string date
        const splittedDate = date.split("-")
        // Retornando formatado
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        // Verificando o sinal que devera ser usado
        const signal = Number(value) < 0 ? "-" : ""
        // Retirando o sinal do numero
        value = String(value).replace(/\D/, "")
        // Dividindo o valor por 100
        value = Number(value) / 100
        // Formatando a moeda para BRL
        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency:"BRL"
        })
        // Devolvendo o valor ja formatado e com o sinal certo
        return signal + value
    }
}

const App = {
    init() {
        // Colocando as informações da transaction table no htm

        // Transaction.all.forEach(function(transaction, index) {
        //     DOM.addTransaction(transaction, index)
        // })
        
        // Forma curta de escrever a função acima
        // ja q são passados os mesmos valores 
        Transaction.all.forEach(DOM.addTransaction)

        // Atualizando os valores do balance
        // de acordo com as transactions
        DOM.updateBalance()

        // Setar as transações
        Storage.set(Transaction.all)
    },
    // Recarregar a pagina
    reload() {
        DOM.clearTransaction()
        App.init()
    }
}

const Form = {
    // Pegar os inputs do formularios
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    // Separar as informações do input
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // Validar os campos
    validateFields() {
        const {description, amount, date} = Form.getValues()
        
        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error("Por favor preencha todos os campos")
        }
    },

    // Formatar os dados do formulario
    formatData() {
        let {description,amount, date} = Form.getValues()
        amount = Util.formatAmount(amount)
        date = Util.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    // Forma alternativa para salvar
    // saveTransaction(transaction) {
    //     Transaction.add(transaction)
    // },

    clearForm() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""

    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatData()
            // Salvando transação
            Transaction.add(transaction)
            // Limpando o formulario
            Form.clearForm()
            // Fechando janela
            Modal.toggle()
            
        } catch(error) {
            alert(error.message)
        }
        
    }
}

App.init()
