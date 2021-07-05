function send(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, message, response => {
            if (response !== "END") {
                callback(response);
            } else if (response == "END") {
                var element = document.getElementById("2");
                element.innerHTML = "Download finished.\nTo restart this extension,\nplease refresh the page";
            }
        })
    })
};

function handler(response) {
    chrome.downloads.download({
        url: response.url,
        filename: response.dir + "/" + response.name
    });
    send({ text: "GET" }, handler);
};

document.getElementById("1").addEventListener("click", () => {
    send({ text: "GET" }, handler);
});