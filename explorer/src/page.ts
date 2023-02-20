export function html(): string {
	return `

<!doctype html>
<html lang="en">

<head>
	<title>Spin KV Explorer</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"
		integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">

	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">


</head>

<body>
	<section class="ftco-section">
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-md-5 text-center mb-5">
					<h2 class="heading-section">Spin KV Explorer</h2>
					<h6 id="storeName"> Default</h6>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<div class="table-wrap">
						<table class="table table-striped" id="kv">
							<thead>
								<tr>
									<th>Key</th>
									<th>Value</th>
								</tr>
							</thead>
							<tbody>

							</tbody>
						</table>
						<div class="row mb-2">
							<div class="col-md-2">
								<input id="keyInput" type="text" class="form-control" placeholder="Key">
							</div>
							<div class="col-md-2">
								<input id="valueInput" type="text" class="form-control" placeholder="Value">
							</div>
							<div class="col-md-1">
								<button id="add" class="btn btn-primary">Add</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"
		integrity="sha512-bnIvzh6FU75ZKxp0GXLH9bewza/OIw6dLVh9ICg0gogclmYGguQJWl8U30WpbsGTqbIiAwxTsbe76DErLq5EDQ=="
		crossorigin="anonymous" referrerpolicy="no-referrer"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/4.5.3/js/bootstrap.min.js"
		integrity="sha512-8qmis31OQi6hIRgvkht0s6mCOittjMa9GMqtK9hes5iEQBQE/Ca6yGE5FsW36vyipGoWQswBj/QBm2JR086Rkw=="
		crossorigin="anonymous" referrerpolicy="no-referrer"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.11.6/umd/popper.min.js"
		integrity="sha512-6UofPqm0QupIL0kzS/UIzekR73/luZdC6i/kXDbWnLOJoqwklBK6519iUnShaYceJ0y4FaiPtX/hRnV/X/xlUQ=="
		crossorigin="anonymous" referrerpolicy="no-referrer"></script>


	<script>

		fetch("/api/stores/default")
			.then((response) => response.json())
			.then((data) => {
				data.keys.forEach((item) => {
					insert(item);
				});
			});


		function insert(key) {
			$("#kv > tbody:first").append(\`
		<tr id="\${key}">
			<td>\${key} </td> 
				<td><a href="#" id="\${key}View" class="btn btn-success view-btn" data-key="\${key}"> View </a>  <a href="#" id="\${key}Delete" class="btn btn-danger delete-btn" data-key="\${key}">Delete</a ></td>
					</tr>\`);

			$(\`#\${key}View\`).click(function () {
				var key = $(this).data("key");
				fetch(\`/api/stores/default/keys/\${key}\`).then((response) => response.json()).then((data) => {
					let decoder = new TextDecoder();
					let value = decoder.decode(new Uint8Array(data.value));
					$("#valueContent").text(value);
					$("#viewModal").modal("show");
				});
			});


			$(\`#\${key}Delete\`).click(function () {
				var key = $(this).data("key");
				fetch(\`/api/stores/default/keys/\${key}\`, {
					method: 'DELETE',
				})
					.then(() => {
						remove(key)
					})
			});

		}

		function remove(key) {
			$(\`#kv #\${key}\`).remove();
		}

		$("#add").click(function () {
			let key = $("#keyInput").val();
			let value = $("#valueInput").val();
			if (key.length == 0) {
				alert("Key must not be empty");
				return
			}

			let data = {
				key: key,
				value: value
			};
			fetch("/api/stores/default", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			})
				.then(() => {
					insert(key)
					$("#keyInput").val("");
					$("#valueInput").val("");
				})
		});
	</script>
</body>

<div class="modal fade" id="viewModal" tabindex="-1" role="dialog" aria-labelledby="viewModalLabel" aria-hidden="true">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<h5 class="modal-title" id="viewModalLabel">View Value</h5>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<p id="valueContent"></p>
			</div>
		</div>
	</div>
</div>


</html>
`
}
