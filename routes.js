var gravatar = require('gravatar');

module.exports = function(app,io){

	app.get('/', function(req, res){

		res.render('home');
	});

	app.get('/create', function(req,res){

		var id = Math.round((Math.random() * 1000000));

		res.redirect('/chat/'+id);
	});

	app.get('/createpublic', function(req,res){

		var id = Math.round((Math.random() * 1000000));

		res.redirect('/chatpublic/123');
	});

	app.get('/chat/:id', function(req,res){

		res.render('chat');
	});
	app.get('/chatpublic/:id', function(req,res){

		res.render('chat');
	});

	var chat = io.on('connection', function (socket) {

		socket.on('load',function(data){

			var room = findClientsSocket(io,data);
			if(room.length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length >= 3) {

				chat.emit('tooMany', {boolean: true});
			}
			else {

				socket.emit('peopleinchat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				});
			}
			
		});

		socket.on('login', function(data) {

			var room = findClientsSocket(io, data.id);
			if (room.length < 10) {

				socket.username = data.user;
				socket.room = data.id;
				//socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
				socket.avatar = data.avatar;

				socket.emit('img', socket.avatar);

				socket.join(data.id);

				if (room.length > 0) {

					var usernames = [],
						avatars = [];

					usernames.push(room[0].username);
					usernames.push(socket.username);

					avatars.push(room[0].avatar);
					avatars.push(socket.avatar);

					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		socket.on('disconnect', function() {

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			socket.leave(socket.room);
		});

		socket.on('msg', function(data){

			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});
	});
};

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/"); 

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}


