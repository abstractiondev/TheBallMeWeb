


$(document).ready(function()
{



	// Action clicks
	$(document).on('click', '[data-action]', function()
	{

		// Get action from data variable
		$action = $(this).data('action');	

		console.log($action);
		
		// switch actions
		switch($action)
		{


			// Monitor start action
			case "startmonitor":


				// Get monitor ID
				$monitorID = $(this).data('monitor-id');

				$(this).prop('disabled', true).val(lang.button.wait);

				// Run action via AJAX
				$.ajax({
					type: "POST",
					data: { "MonitorID": $monitorID },
					url: "/actions.php?a=StartMonitor",
					context: this,
					success: function(response)
					{


						console.log(response);


						// If got an error
						if(response.error)
						{

							alert(response.error);
							$(this).prop('disabled', false).val(lang.button.startmonitor);
							return;
						}

						// Edit button style and action
						$(this).prop('disabled', false);
						$(this).prop('value', lang.button.shutdown);

						$(this).parent().parent().find('img').attr('src', '/img/MonitorStates/monitor-1.png');

						$(this).data('action', 'shutdownmonitor').removeClass('btn-success').addClass('btn-danger');

					},
					error: function(response)
					{
						alert("Error! See console!");
						console.log(response);
					}
				});


				break;

			case "shutdownmonitor":

				// Get monitor ID
				$monitorID = $(this).data('monitor-id');
				$(this).prop('disabled', true).val(lang.button.wait);

				// Run action via AJAX
				$.ajax({
					type: "POST",
					context: this,
					data: { "MonitorID" : $monitorID },
					url: "/actions.php?a=ShutdownMonitor",
					success: function(response)
					{


						console.log(response);


						// If got an error
						if(response.error)
						{
							alert(lang.notify.error + ": " + response.error);
							return;
						}

						// Edit button style and action
						$(this).prop('disabled', false);
						$(this).prop('value', lang.button.startmonitor);

						$(this).parent().parent().find('img').attr('src', '/img/MonitorStates/monitor-0.png');

						$(this).data('action', 'startmonitor').removeClass('btn-danger').addClass('btn-success');

					},
					error: function(response)
					{
						alert("Error! See console!");
						console.log(response);
					}
				});


				break;

		}


	})




});