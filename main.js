const chatInput = document.querySelector("#chat-input")
const sendButton = document.querySelector("#send-btn")
const chatContainer = document.querySelector(".chat-container")
const themeButton = document.querySelector("#theme-btn")
const deleteButton = document.querySelector("#delete-btn")
console.log(deleteButton)

let userText = null   //soru soracağımız yerin içindeki veriyi almak için globalde bir let tanımladık. başlangıçta biz null yaptık. boş string de olurdu

const API_KEY = // private...

const initialHeight = chatInput.scrollHeight

// sayfa yüklendiğinde yerel depodan(localStorage) veri yükler
const loadDataFromLocalStorage = () =>{
    // tema rengini kontrol eder ve geçerli temay uygular
    const themeColor = localStorage.getItem("theme-color")
    // document.body.classList.toggle("light-mode", themeColor === "light_mode")
    // tema rengini yerel depoda günceller
    localStorage.setItem("theme-color", themeButton.innerText)
    themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
    // sohbet içeriğini yerel depodan alır veya varsayılan içeriği uygular
    const defaultText = `
        <div class="default-text">
            <h1>ChatGPT Clone</h1>
            <br>
            <h4>How can I help you today?</h4>
        </div>
        `
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText
    // sayfayı sohbetin en altına kaydırır
    chatContainer.scrollTo(0, chatContainer.scrollHeight)
}
loadDataFromLocalStorage()

const createElement = (html, className) =>{
    // yeni div oluşturma ve belirtilen chat sınıfını ekleme
    // div'in html içeriğini ayarlama
    const chatDiv = document.createElement("div") // outgoing kapsayıcıyı oluşturduk, bu kapsayıcının içine chat-contenti göndereceğiz
    chatDiv.classList.add("chat", className)
    chatDiv.innerHTML = html 
    return chatDiv;    //chatdivi dışarda kullanabilmek için return ettik
}


const getChatResponse = async (incomingChatDiv)=>{
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");
    // api talebi için özelliklerini ve verileri tanımlama
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type":"application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null,
        }),
    }
    //API yanıtına post isteği gönderin ve yanıtı paragraf  metni olarak ayarlayın
    try{
        const response = await (await fetch(API_URL, requestOptions)).json(); //attığımız isteği amait ile beklememiz gerekiyor. sonra bunu parantez içine alıp buaradan gelen cevabı json'a çevireceğiz
        pElement.textContent = response.choices[0].text.trim();  //Cannot read properties of undefined (reading '0') at getChatResponse hatası alıyorum
    }catch(error){
        console.log(error)
        pElement.textContent = "Oppsss"
    }
    incomingChatDiv.querySelector(".typing-animation").remove()
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement)
    chatContainer.scrollTo(0, chatContainer.scrollHeight)
    localStorage.setItem("all-chats", chatContainer.innerHTML)
}

const showTypingAnimation = ()=>{
    const html = `<div class="chat-content">
    <div class="chat-details">
        <img src="img/chatbot.jpg" alt="chat">
        <div class="typing-animation">
            <div class="typing-dot" style="--delay: 0.2s"></div>
            <div class="typing-dot" style="--delay: 0.3s"></div>
            <div class="typing-dot" style="--delay: 0.4s"></div>
        </div>
    </div>
    <span class="material-symbols-outlined">content_copy</span>
</div>`
const incomingChatDiv = createElement(html, "incoming")
chatContainer.appendChild(incomingChatDiv)
chatContainer.scrollTo(0, chatContainer.scrollHeight)
getChatResponse(incomingChatDiv)
}

const handleOutGoingChat = () =>{
    userText = chatInput.value.trim()  //chatInputun içindeki değeri alabilmek için value'yi kullanıyoruz
    if (!userText) return; //eğer chatInput boşsa burası çalışmasın. API'ye durduk yere istek atılması. userText===null yapsak da olurdu
    //userText'in içine vereceğimiz veri, chatInputun içine yazdığımız veri olması gerekiyor.
    //trim(), girdiimiz yazının başındaki ve sonundaki boşlukları atar. API'ler için boşluk olması sıkıntılı
    const html = `<div class="chat-content">
    <div class="chat-details">
        <img src="img/user.jpg" alt="user">
        <p>
        ${userText}
        </p>
    </div>
</div>`
//bu kısmı dinamk yapmak için html den bu kısmı aldık
const outGoingChatDiv = createElement (html, "outgoing") //burada htmld deki outgoing kapsayıcsını oluşturuyoruz
outGoingChatDiv.querySelector("p").textContent = userText
document.querySelector(".default-text")?.remove()
chatContainer.appendChild(outGoingChatDiv)
chatContainer.scrollTo(0, chatContainer.scrollHeight)
setTimeout(showTypingAnimation, 500)  //showTypingAnimation fonksiyonu 500ms sonra çalışsın dedik. o fonksiyonda chatGPT'nin cevap verdiği kısım oluyor

} 

themeButton.addEventListener("click", ()=>{
    document.body.classList.toggle("light-mode")
    localStorage.setItem("theme-color", themeButton.innerText)
    themeButton.innerText = document.body.classList.contains("light-mode")
    ? "dark_mode"
    : "light_mode";
})

deleteButton.addEventListener("click", ()=>{
    if(confirm("Tüm sohbeti silmek istediğinize emin misiniz?")){
        localStorage.removeItem("all-chats")
        loadDataFromLocalStorage()
    }
})

chatInput.addEventListener("input", ()=>{
    chatInput.style.height = `${initialHeight}px`
    chatInput.style.height = `${chatInput.scrollHeight}px`
})
chatInput.addEventListener("keydown", (e)=>{
    if (e.key === "Enter"){
        e.preventDefault()
        handleOutGoingChat()
    }
})
// enter tuşunu kullanmak için

sendButton.addEventListener("click", handleOutGoingChat)
// sendButton click olduğunda handleOutGoingChat fonksiyonu çalışsın
