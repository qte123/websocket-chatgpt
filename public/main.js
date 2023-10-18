$(document).ready(function () {
    const chatBox = $("#chat-box");
    const userInput = $("#user-input");
    const systemInput = $("#system-input");
    const sendButton = $("#send-button");
    const stopButton = $("#stop-button");
    let socket;


    userInput.keydown(function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // 阻止默认的回车行为
            var selectedValue = $('input[type=radio]:checked').val()
            if (!$('input[type="radio"]').prop('disabled')) {
                if (userInput.val() !== "") {
                    $('input[type="radio"]').prop('disabled', true);
                    systemInput.prop('disabled', true);
                    sendButton.prop("disabled", true);
                    sendButton.removeClass("send-button");
                    sendButton.text("loading......")
                    sendButton.addClass("disabled-button");
                    sendMessage(selectedValue);
                }
            }
        }
    });

    sendButton.click(function () {
        var selectedValue = $('input[type=radio]:checked').val()

        if (userInput.val() !== "") {
            $('input[type="radio"]').prop('disabled', true);
            systemInput.prop('disabled', true);
            sendButton.prop("disabled", true);
            sendButton.removeClass("send-button");
            sendButton.text("loading......")
            sendButton.addClass("disabled-button");
            sendMessage(selectedValue);
        }
    });

    stopButton.click(function () {
        if (socket) {
            socket.close();
        }
    });

    function sendMessage(selectedValue) {
        const userMessage = userInput.val();
        appendUserMessage(userMessage);
        userInput.val("");
        $("#token_length").text("0");
        $("#character_length").text("0");
        $("#spend_time").text("0");
        $("#token_efficiency").text("0");
        $("#character_efficiency").text("0");
        if (selectedValue === "exllama") {
            socket = new WebSocket("ws://dev.dtsci.cn:22333/ws/chat/");
            socket.onopen = function (event) {
                console.log("WebSocket connection opened.");
                const system_prompt_ = systemInput.val() !== "" ? systemInput.val() : "You are a helpful assistant";
                const requestData = {
                    user_prompt: userMessage,
                    username: "User123",
                    botname: "ChatBot",
                    system_prompt: system_prompt_
                };
                socket.send(JSON.stringify(requestData));
                appendBotMessage("loading......", false);
            };
        } else {
            socket = new WebSocket("ws://dev.dtsci.cn:22333/v1/chat/");
            socket.onopen = function (event) {
                console.log("WebSocket connection opened.");
                const system_prompt_ = systemInput.val() !== "" ? systemInput.val() : "You are a helpful assistant";
                const requestData = {
                    user_prompt: userMessage,
                    system_prompt: system_prompt_
                };
                socket.send(JSON.stringify(requestData));
                appendBotMessage("loading......", false);
            };
        }
        flag = true
        socket.onmessage = function (event) {
            const responseData = JSON.parse(event.data);
            console.log(responseData)
            chunk = responseData.chunk;
            token_length = responseData.token_length;
            character_length = responseData.character_length
            spend_time = responseData.spend_time;
            token_efficiency = responseData.token_efficiency;
            character_efficiency = responseData.character_efficiency;


            const messageElement = $(".message.bot-message:last-child");

            if (flag) {
                messageElement.text("")
                flag = false
            }

            var stringWithNbsp = chunk.replace(/ {2,}/g, function (match) {
                var nbspCount = match.length - 1;
                var nbspString = "&nbsp;".repeat(nbspCount);
                return nbspString;
            });
            let new_chunk = stringWithNbsp.replace("\n", "<br>");
            messageElement.html(messageElement.html() + new_chunk);
            $("#token_length").text(token_length);
            $("#character_length").text(character_length);
            $("#spend_time").text(spend_time);
            $("#token_efficiency").text(token_efficiency);
            $("#character_efficiency").text(character_efficiency);

            chatBox.scrollTop(chatBox[0].scrollHeight);
        };


        socket.onclose = function (event) {
            const messageElement = $(".message.bot-message:last-child");
            if (messageElement.length) {
                if (messageElement.text() === "") {
                    messageElement.remove();
                }
            }
            if (messageElement.text() === "loading......") {
                messageElement.remove();
            }

            if (event.wasClean) {
                console.log("WebSocket connection closed cleanly");
                sendButton.prop("disabled", false);
                sendButton.removeClass("disabled-button");
                sendButton.addClass("send-button");
                sendButton.text("Send")
            } else {
                messageElement.css("color", "red");
                messageElement.text("WebSocket connection died, please try again!");
                console.error("WebSocket connection died");
                sendButton.prop("disabled", false);
                sendButton.removeClass("disabled-button");
                sendButton.addClass("send-button");
                sendButton.text("Send")
            }
            $('input[type="radio"]').prop('disabled', false);
            systemInput.prop("disabled", false)
        };
    }

    function appendUserMessage(message) {
        const messageElement = $("<div>").addClass("message user-message").text(message);
        chatBox.append(messageElement);
    }

    function appendBotMessage(s, isShow) {
        var messageElement
        if (isShow) {
            messageElement = $("<div>").addClass("message bot-message");
        } else {
            messageElement = $("<div>").addClass("message bot-message").hide();
        }

        const lastMessageElement = $(".user-message:last-child");
        messageElement.text(s)
        if (lastMessageElement.length) {
            lastMessageElement.after(messageElement);
        } else {
            chatBox.append(messageElement);
        }

        chatBox.scrollTop(chatBox[0].scrollHeight);
        messageElement.show();
    }
});