var errDiv = $('#error');
var qrDiv = $('#qr');
var $div3 = $('#3d');
var cube;
function coords (a,b,g) {
	cube.rotation.y = Math.round(a)/100;
	cube.rotation.x = Math.round(b)/100;
	cube.rotation.z = Math.round(g)/100;
}
function reset() {
	cube.rotation.x = 0;
	cube.rotation.y = 0;
	cube.rotation.z = 0;
}

function three() {
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	var geometry = new THREE.CubeGeometry(2,2,2);
	var material = new THREE.MeshBasicMaterial( { 
    color: 0x003399, 
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors,
    wireframe: true
} );

	cube = new THREE.Mesh( geometry, material );
	var directionalLight = new THREE.DirectionalLight(0xEEEEEE);
	directionalLight.position.set(10, 1, 1).normalize();
	
	cube.rotation.x = 0;
	cube.rotation.y = 0;
	cube.rotation.z = 0;
	
	$div3.append( renderer.domElement );
	
	scene.add( cube );
	scene.add(directionalLight);

	camera.position.z = 5;

	function render () {
		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}
	

	render();
}


var isMobile = function (m) {
	if (window.chrome) {
		var socket = io.connect(window.location.origin);
		socket.on('connected', function (d) {
			var hash = '';
			if (m) {
				hash = window.location.hash.replace('#','');
			}
			socket.emit('identify', {mobile: m, key: hash});
		});
		socket.on('generateQR', function (d) {
			qrDiv.text('');
			var qrcode = new QRCode("qr").makeCode(window.location.origin+'/'+d.hash);
		});
		socket.on('clearQR', function (d) {
			qrDiv.hide();
			errDiv.text('Established connection succesfully! Starting app...');
		});
		socket.on('prepareDesk', function (d) {
			errDiv.hide();
			qrDiv.hide();
			three();
		});
		socket.on('prepareMob', function (d) {
			$('#error').show();
			$('#error').html('<h1 style="text-align: center; color: white;">Beweeg dit apparaat en kijk naar het scherm van de laptop!</h1>');
			if (window.DeviceOrientationEvent) {
			    window.addEventListener("deviceorientation", function( event ) {
			    	socket.emit('motiondata', {alpha: event.alpha, beta: event.beta, gamma: event.gamma});
			    }, false);
			} else {

			}
		});
		socket.on('motion', function (e) {
			coords(e.alpha, e.beta, e.gamma);
		});
		socket.on('problem', function (d) {
			errDiv.text(d.e);
		});
	}
}

$(function () {
	var ua = navigator.userAgent||navigator.vendor||window.opera;
	if (ua.search('Android') >=1 && window.chrome) {
		isMobile(true);
	} else if (window.chrome) {
		
		isMobile(false);
	} else {
		
	}
	
});
/**/




//