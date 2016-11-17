

var resive = false;
$(function() {

    var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

    var socket = io();

    var name = "",
        email = "",
        img = "",
        friend = "";

    var section = $(".section"),
        footer = $("footer"),
        onConnect = $(".connected"),
        inviteSomebody = $(".invite-textfield"),
        personInside = $(".personinside"),
        chatScreen = $(".chatscreen"),
        left = $(".left"),
        noMessages = $(".nomessages"),
        tooManyPeople = $(".toomanypeople");

    var chatNickname = $(".nickname-chat"),
        leftNickname = $(".nickname-left"),
        loginForm = $(".loginForm"),
        yourName = $("#yourName"),
        yourEmail = $("#yourEmail"),
        hisName = $("#hisName"),
        hisEmail = $("#hisEmail"),
        chatForm = $("#chatform"),
        textarea = $("#message"),
        messageTimeSent = $(".timesent"),
        chats = $(".chats");

    var ownerImage = $("#ownerImage"),
        leftImage = $("#leftImage"),
        noMessagesImage = $("#noMessagesImage");


    socket.on('connect', function() {

        socket.emit('load', id);
    });

    socket.on('img', function(data) {
        img = data;
    });

    socket.on('peopleinchat', function(data) {

        if (data.number === 0) {

            showMessage("connected");

            loginForm.on('submit', function(e) {

                e.preventDefault();

                name = $.trim(yourName.val());

                if (name.length < 1) {
                    alert("Tu nombre tiene que tener mas de 1 caracter!");
                    return;
                }

                email = yourEmail.val();

                if (!isValid(email)) {
                    alert("El correo es invalido!");
                }
                else {
                    notifyMe("Información.", "Esperando usuario con quien chatear.", data);
                    showMessage("inviteSomebody");
                    socket.emit('login', { user: name, avatar: email, id: id });

                }

            });
        }

        else if (data.number === 1) {

            showMessage("personinchat", data);

            loginForm.on('submit', function(e) {

                e.preventDefault();

                name = $.trim(hisName.val());

                if (name.length < 1) {
                    alert("Tu nombre tiene que tener mas de 1 caracter!");
                    return;
                }

                if (name == data.user) {
                    alert("El usuario \"" + name + "\" ya esta en esta sala de chat!");
                    return;
                }
                email = hisEmail.val();

                if (!isValid(email)) {
                    alert("Correo invalido!");
                }
                else {
                    socket.emit('login', { user: name, avatar: email, id: id });
                }

            });
        }

        else {
            showMessage("tooManyPeople");
        }

    });


    socket.on('startChat', function(data) {
        console.log(data);
        if (data.boolean && data.id == id) {

            chats.empty();

            if (name === data.users[0]) {
                notifyMe("Información", data.users[1] + " ha entrado del chat.", data);
                showMessage("youStartedChatWithNoMessages", data);
            }
            else {

                showMessage("heStartedChatWithNoMessages", data);
            }

            chatNickname.text(friend);
        }
    });

    socket.on('leave', function(data) {

        if (data.boolean && id == data.room) {

            showMessage("somebodyLeft", data);
            chats.empty();
            notifyMe("Información", data.user + " ha salido del chat.", data);
        }

    });

    socket.on('tooMany', function(data) {

        if (data.boolean && name.length === 0) {

            showMessage('tooManyPeople');
        }
    });

    socket.on('receive', function(data) {
        showMessage('chatStarted');

        if (data.msg.trim().length) {
            resive = true;
            recibeChatMessage(data.msg, data.user, data.img, moment());
            scrollToBottom();
            notifyMe(data.user + " dice:", data.msg, data);
        }
    });

    textarea.keypress(function(e) {


        if (e.which == 13) {
            e.preventDefault();
            chatForm.trigger('submit');
        }

    });

    chatForm.on('submit', function(e) {

        e.preventDefault();

        showMessage("chatStarted");

        if (textarea.val().trim().length) {
            createChatMessage(textarea.val(), name, img, moment());
            scrollToBottom();
            resive = false;
            socket.emit('msg', { msg: textarea.val(), user: name, img: img });

        }
        textarea.val("");
    });


    setInterval(function() {

        messageTimeSent.each(function() {
            var each = moment($(this).data('time'));
            $(this).text(each.fromNow());
        });

    }, 60000);
    function notifyMe(titulo, contenido, data) {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        }

        else if (Notification.permission === "granted") {
            var options1 = {
                body: contenido,
                icon: data.img
            };
            var notification = new Notification(titulo, options1);
            setTimeout(function() { notification.close() }, 3000);
        }

        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function(permission) {
                if (permission === "granted") {
                    var notification = new Notification("Se han activado las notificaciones!");
                }
            });
        }

    }
    $(document).ready(function() {
        
    });
    $(window).focus(function() {
        window_focus = true;
    })
        .blur(function() {
            window_focus = false;
        });

    function AskForWebNotificationPermissions() {
        if (Notification) {
            Notification.requestPermission();
        }
    }
    function GetWebNotificationsSupported() {
        return (!!window.Notification);
    }
    
    var ident = 1;
    var inc = 1;
    var inc2 = 1;
    function recibeChatMessage(msg, user, imgg, now) {
        inc2 = 1;
        if (messageTimeSent.last().text() != now.fromNow()) {
            inc = 1;
        }
        if (inc == 1) {
            var who = '';

            if (user === name) {
                who = 'me';
            }
            else {
                who = 'you';
            }

            var li = $(
                '<li class=' + who + '>' +
                '<div class="image">' +
                '<img src=' + imgg + ' />' +
                '<b></b>' +
                '<i id="timesent' + ident + '" class="timesent" data-time=' + now + '></i> ' +
                '</div>' +
                '<p id="' + ident + 't"></p>' +
                '</li>');
            ident++;
            inc++;

            li.find('b').text(user);

            chats.append(li);

            var realident = ident - 1;
            var contnt = $("#" + realident + "t").html();
            contnt = contnt + checktxtEmotic(msg);
            $("#" + realident + "t").html(contnt);



        }
        else {
            var realident = ident - 1;
            var contnt = $("#" + realident + "t").html();
            contnt = contnt + "<br/>" + checktxtEmotic(msg);
            $("#" + realident + "t").html(contnt);
        }
        var realident2 = ident - 1;
        messageTimeSent = $("#timesent" + realident2);
        now.locale('es');
        messageTimeSent.last().text(now.fromNow());
    }
    function createChatMessage(msg, user, imgg, now) {
        inc = 1;
        if (messageTimeSent.last().text() != now.fromNow()) {
            inc2 = 1;
        }

        if (inc2 == 1) {
            var who = '';

            if (user === name) {
                who = 'me';
            }
            else {
                who = 'you';
            }

            var li = $(
                '<li class=' + who + '>' +
                '<div class="image">' +
                '<img src=' + imgg + ' />' +
                '<b></b>' +
                '<i id="timesent' + ident + '" class="timesent" data-time=' + now + '></i> ' +
                '</div>' +
                '<p id="' + ident + 't"></p>' +
                '</li>');
            ident++;
            inc2++;

            li.find('b').text(user);

            chats.append(li);

            var realident = ident - 1;
            var contnt = $("#" + realident + "t").html();
            contnt = contnt + checktxtEmotic(msg);
            $("#" + realident + "t").html(contnt);

        }
        else {
            var realident = ident - 1;
            var contnt = $("#" + realident + "t").html();
            contnt = contnt + "<br/>" + checktxtEmotic(msg);
            $("#" + realident + "t").html(contnt);
        }
        var realident2 = ident - 1;
        messageTimeSent = $("#timesent" + realident2);
        now.locale('es');
        messageTimeSent.last().text(now.fromNow());
    }
    function checktxtEmotic(context) {
        var result = context;
        var emotics = [":d:", ":xd:", ":p:"];
        var directorios = ["risa", "equizde", "burlon"];
        for (var a = 0; a < emotics.length; a++) {
            if (context.indexOf(emotics[a]) >= 0) {
                result = context.replace(new RegExp(emotics[a], 'gi'), "<img src='/img/Emoticons/" + directorios[a] + ".png' width='5%' height='5%'/>")
            }
        }
        return result;
    }


    function scrollToBottom() {
        $("html, body").animate({ scrollTop: $(document).height() - $(window).height() }, 1000);
    }

    function isValid(thatemail) {

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(thatemail);
    }
    function showMessage(status, data) {

        if (status === "connected") {

            section.children().css('display', 'none');
            onConnect.fadeIn(1200);
        }

        else if (status === "inviteSomebody") {

            $("#link").text(window.location.href);

            onConnect.fadeOut(1200, function() {
                inviteSomebody.fadeIn(1200);
            });
        }

        else if (status === "personinchat") {

            onConnect.css("display", "none");
            personInside.fadeIn(1200);

            chatNickname.text(data.user);
            ownerImage.attr("src", data.avatar);
        }

        else if (status === "youStartedChatWithNoMessages") {

            left.fadeOut(1200, function() {
                inviteSomebody.fadeOut(1200, function() {
                    noMessages.fadeIn(1200);
                    footer.fadeIn(1200);
                });
            });

            friend = data.users[1];
            noMessagesImage.attr("src", data.avatars[1]);
        }

        else if (status === "heStartedChatWithNoMessages") {

            personInside.fadeOut(1200, function() {
                noMessages.fadeIn(1200);
                footer.fadeIn(1200);
            });

            friend = data.users[0];
            noMessagesImage.attr("src", data.avatars[0]);
        }

        else if (status === "chatStarted") {

            section.children().css('display', 'none');
            chatScreen.css('display', 'block');
        }

        else if (status === "somebodyLeft") {

            leftImage.attr("src", data.avatar);
            leftNickname.text(data.user);

            section.children().css('display', 'none');
            footer.css('display', 'none');
            left.fadeIn(1200);
        }

        else if (status === "tooManyPeople") {

            section.children().css('display', 'none');
            tooManyPeople.fadeIn(1200);
        }
    }

});
function showEmoticons() {
    var content = $("#message").val();
    content = content + ":d:";
    $("#message").val(content);
}
