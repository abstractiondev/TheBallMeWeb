$(function()
{



	$(document).on('click', '.side-nav-master', function() {

		if($(this).find('i.fa').hasClass('fa-chevron-left'))
		{
			$(this).find('i.fa').removeClass('fa-chevron-left').removeClass('sub-opened').addClass('fa-chevron-down').addClass('sub-opened');
		}
		else
		{
			$(this).find('i.fa').removeClass('fa-chevron-down').removeClass('sub-opened').addClass('fa-chevron-left').addClass('sub-opened');
		}


	});



	$(document).on('scroll', function() {

		if($(document).scrollTop() > 50)
		{
			$('.top-nav').slideUp('fast');
		}
		else
		{
			$('.top-nav').slideDown('fast');
		}

	});


})