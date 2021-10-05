const Modal = {
        open(){
          //Adicionar class active ao Modal
          document
            .querySelector('.modal-overlay')
              .classList
              .add('active')
        },
        close(){
          //Remover a classe active do Modal
          document
            .querySelector('.modal-overlay')
              .classList
              .remove('active')
        }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("Leandroyy:finances")) || []
    },
    set(transactions){
        localStorage.setItem("Leandroyy:finances",JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)

        App.reload()
    },


    incomes() {
        // pegar todas as transaçoes maior que zero, se for maior que zero somar a uma variavel e retornar a variavel

        let income = 0

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0 ){
                income = income + transaction.amount; 
            }
        })

        return income
    },

    expenses(){
        let expense = 0

        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0 ){
                expense = expense + transaction.amount; 
            }
        })
        return expense
    },

    total(){
        
        return Transaction.incomes() + Transaction.expenses()
    }
} 

const DOM = {
    transactionsContainer:document.querySelector('#data-table tbody'),

    addTransaction(transaction,index){
        const tr = document.createElement('tr')
        tr.innerHTML=DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },
    innerHTMLTransaction(transaction,index){
        const CSSclass = transaction.amount > 0 ? "income":"expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="RemoverTransação">
            </td>
        `

        return html
    },
    updateBalance(){
        document
        .getElementById("income-display")
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
        .getElementById("expense-display")
        .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
        .getElementById("total-display")
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }

}

const Utils = {

    formatAmount(value){
        value = Number(value) * 100
        return value
    },

    formatDate(date){
        const splitedDate = date.split("-")

        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? '-':''

        value = String(value).replace(/\D/g,"")

        value = Number(value) /100 
        
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {

    description:document.querySelector("input#description"),
    date:document.querySelector("input#date"),
    amount:document.querySelector("input#amount"),


    clearFields(){
        Form.description.value = ""
        Form.date.value = ""
        Form.amount.value = ""
    },
    saveTransaction(transaction){
        Transaction.add(transaction)
    },
    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    formatData(){
        let {description,amount,date} = Form.getValues()
        
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return{
            description,
            amount,
            date
        }
    },
    validateFields(){
        const {description,amount,date} = Form.getValues()

        if( description.trim() === "" || 
            amount.trim() === "" ||
            date.trim() === ""){
                throw new Error("Preencha todos os campos")
        }
    },

    submit(event){
        event.preventDefault()

        try {
            //verificar se as informaçoes foram preenchidas 
            this.validateFields()
            //Formatar dados para salvar
            const transaction = this.formatData()
            //salvar 
            this.saveTransaction(transaction)
            //apagar os dados do formulario
            this.clearFields()
            // fechar
            Modal.close()
        } catch (error) {
            alert(error.message)
        }

        
    }
} 

const App = {
    init(){
        Transaction.all.forEach((transaction, index)=>{
            DOM.addTransaction(transaction,index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    },
}

App.init()