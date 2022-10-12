(function($) {
	$.fn.catchEnter = function(sel) {
		return this.each(function() {
			$(this).on('keyup', sel, function(e) {
				if (e.keyCode == 13)
					$(this).trigger('enterkey');
			})
		});
	};
})(jQuery);


$(document).ready(() => {
    requestOTP();
	$('#mfa-btn').on('click', verifyOTP);
	$('.form-control').on('keydown', () => {
		$('#resp-msg').hide()
	});
	$('.form-control').catchEnter().on('enterkey', verifyOTP);

});

function toggleInputs(state) {
	$('#otp').prop('disabled', state);
    $('#mfa-btn').prop('disabled', state);
}


async function requestOTP() {

	toggleInputs(true);

	// prepare alert
	let card = $('#resp-msg');
	card.attr('class', 'alert alert-info');
	card.hide();

	await fetch('/api/otp/request', {
			method: 'GET'
		})
		.then((response) => response.json()
			.then((resp) => {
				card.attr('class', 'alert alert-danger');
				if (response.status == 200) {
                    toggleInputs(false);
                    return;
				}
				card.text(resp.message);
				card.show();
			}))
		.catch((error) => {
			card.text(error);
			card.attr('class', 'alert alert-danger');
			card.show();
		});

	toggleInputs(false);
}

async function verifyOTP() {

	toggleInputs(true);

	// prepare alert
	let card = $('#resp-msg');
	card.attr('class', 'alert alert-info');
	card.hide();

	// validate
	let otp = $('#otp').val();
	if ($.trim(otp) === '' || isNaN(parseInt(otp))) {
		toggleInputs(false);
		card.text('Please submit a valid OTP code');
		card.attr('class', 'alert alert-danger');
		card.show();
		return;
	}

	await fetch('/api/otp/verify', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({otp: parseInt(otp)}),
		})
		.then((response) => response.json()
			.then((resp) => {
				card.attr('class', 'alert alert-danger');
				if (resp.hasOwnProperty('flag')) {;
                    decryptVault(resp);
                    toggleInputs(false);
                    return;
				}
                if (resp.hasOwnProperty('message')){
                    card.text(resp.message);
				    card.show();
                    return;
                }
                card.text('Invalid OTP code provided');
                card.show();
			}))
		.catch((error) => {
			card.text(error);
			card.attr('class', 'alert alert-danger');
			card.show();
		});

	toggleInputs(false);
}

const decryptVault = (data) => {
    $('.mfa-desc').hide();
    $('.mfa-title').text('Access Granted');
    $('.v-card').addClass('pt-0');
    $('.v-card').html($('<p>', {class: 'alert alert-secondary text-center'}).text(data.flag));
}