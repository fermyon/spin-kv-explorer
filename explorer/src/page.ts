export function html(): string {
	return `

	<!doctype html>
	<html lang="en">
	
	<head>
		<title>&#216; Spin &mdash; Key Value Explorer</title>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
	
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"
			integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.3.0/css/all.min.css">
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Chivo+Mono:wght@300;600&display=swap" rel="stylesheet">
	
		<style>
			html, body {
				margin: 0;
				padding: 0;
				scroll-behavior: smooth;
				color: white;
				font-family: 'Chivo Mono', monospace;
				height: 100vh; 
				background: black;
				background-image: linear-gradient(0deg, rgba(0, 0, 0, 1.0), rgba(26, 18, 70, 1.0));
			}
	
			#grid-container {
				display: grid;
				grid-template-columns: 260px 3fr;
				grid-template-areas: "h h" "n m" "f f";
			}
	
			#h-container {
				grid-area: h;
				position: fixed;
				width: 100vw;
				height: 70px;
				display: flex;
				color: ghostwhite;
				padding: 1rem 1.5rem;
			}
	
			#h-container h1 {
				font-size: 1.33rem;
				margin: 0.6rem 2.25rem;
				font-weight: 300;
			}
			#n-container {
				grid-area: n;
				position: fixed;
				top: 70px;
				overflow-y: scroll;
				width: 260px;
				height: 100%;
				padding: 2.67rem 0 1rem;
			}
	
			#n-container a {
				color: ghostwhite;
				font-size: 1rem;
				font-weight: 300;
				line-height: 2;
				position: relative;
				display: block;
				padding-left: 4.5rem;
				transition: ease-in-out;
				border-radius: 0 0.5rem 0.5rem 0;
			}
	
			#n-container a:hover {
				background: rgba(31, 188, 160, 0.925);
				color: #0D203F;
				background: rgb(58,213,192);
				background: linear-gradient(180deg, rgba(58,213,192,1) 0%, rgba(31,188,160,1) 100%); 
			}
	
			#n-container a i {
				color: #525776 !important;
				font-size: 1.67rem;
				position: absolute;
				left: 2rem;
				top: 0.67rem;
			}
	
			#m-container {
				grid-area: m;
				position: fixed;
				top: 75px;
				left: 282px;
				right: 25px;
				bottom: 25px;
				width: auto;
				height: auto;
				padding-left: 50px;
				padding-right: 20px;
				overflow-y: scroll;
				background-color: #20294A;
				border-radius: 0.5rem;
				box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.1),0 0 0 1px rgba(10,10,10,.02);
			}
	
			#f-container {
				grid-area: f;
				position: fixed;
				bottom: 0;
				width: 100%;
				height: 40px;
				background: none;
				text-align: center;
			}
			.nav-link-bottom {
				position: fixed !important;
				left: 0;
				width: 260px;
				bottom: 45px;
			}
	
			.about-kv p a {
				color: #BEA7E5;
			}
			.about-kv p code {
				background-color: ghostwhite;
				color: black;
				padding: 0 0.3rem;
				border-radius: 0.2rem;
			}
	
			.table-wrap, .about-kv {
				padding-top: 40px;
			}
	
			.table-wrap table {
				margin-right: 25px;
				color: ghostwhite;
				border-radius: 0.5rem;
				overflow: hidden;
				border: none;
				box-shadow: 0 .5em 1em -.125em rgba(10,10,10,.1),0 0 0 1px rgba(10,10,10,.02);
			}
			.table-wrap table th {
				border: none;
			}
			.table-wrap table thead {
				border-radius: 0.5rem 0 0 0.5rem;
			}
			.add-kv {
				padding: 0 0 25px;
			}
		</style>
	</head>
	
	<body>
	
		<div id="grid-container">
			<div id="h-container">
				<svg width="130" height="45" viewBox="0 0 130 45" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M19.0914 3.98045C17.9636 3.98045 16.8634 4.08716 15.7941 4.28337C15.7528 4.29026 15.7184 4.25928 15.7184 4.21797V0.355662C15.7184 0.266161 15.6462 0.19043 15.5534 0.19043H11.4378C11.3484 0.19043 11.2727 0.262719 11.2727 0.355662V5.70506C11.2727 5.72916 11.259 5.75325 11.2349 5.76358C5.12506 8.69645 0.902832 14.9512 0.902832 22.1904C0.902832 29.4297 5.12506 35.681 11.2349 38.6173C11.259 38.6276 11.2727 38.6517 11.2727 38.6758V44.0252C11.2727 44.1147 11.3449 44.1904 11.4378 44.1904H15.5534C15.6428 44.1904 15.7184 44.1181 15.7184 44.0252V40.1594C15.7184 40.1181 15.7563 40.0872 15.7941 40.094C16.8634 40.2903 17.9636 40.397 19.0914 40.397C29.1381 40.397 37.28 32.2455 37.28 22.187C37.28 12.1285 29.1347 3.98045 19.0914 3.98045ZM5.18351 22.1904C5.18351 17.4572 7.55593 13.2713 11.1696 10.7515C11.2143 10.7206 11.2762 10.7515 11.2762 10.8066V33.5743C11.2762 33.6293 11.2143 33.6603 11.1696 33.6293C7.55593 31.113 5.18351 26.9236 5.18351 22.1904V22.1904ZM20.6318 36.0321C18.9676 36.2145 17.3585 36.0975 15.8457 35.7326C15.77 35.7154 15.7184 35.6465 15.7184 35.5708V8.81349C15.7184 8.73776 15.77 8.66892 15.8457 8.6517C16.8875 8.40041 17.974 8.26616 19.0948 8.26616C27.0407 8.26616 33.4532 14.9718 32.9787 23.0304C32.5833 29.7498 27.3158 35.2989 20.6352 36.0321H20.6318Z" fill="white"/>
					<path d="M49.6682 25.5123C49.7439 25.4159 49.8883 25.4331 49.9502 25.5364C51.3599 27.9873 53.8801 29.261 56.5001 29.261C59.1201 29.261 60.712 28.2834 60.712 26.4279C60.712 24.8754 59.5327 24.3694 57.9167 23.9667L53.636 22.989C50.6722 22.3143 48.3445 20.662 48.3445 17.1198C48.3445 13.2747 51.3771 10.6414 55.8915 10.6414C59.6015 10.6414 62.3383 12.273 63.9956 14.5725C64.0437 14.6414 64.0369 14.7343 63.9784 14.7928L61.6094 17.2851C61.5303 17.3677 61.3928 17.3505 61.3378 17.2507C60.3063 15.4297 58.5218 14.0837 55.8881 14.0837C53.7667 14.0837 52.2813 15.0957 52.2813 16.8513C52.2813 18.3694 53.4263 18.841 54.977 19.2128L58.9207 20.156C62.5584 20.9994 64.6833 22.6861 64.6833 26.2627C64.6833 30.3797 61.0765 32.7068 56.4932 32.7068C52.5358 32.7068 49.2694 31.1302 47.4333 28.4968C47.3886 28.4348 47.3921 28.3488 47.4402 28.2868L49.6613 25.5157L49.6682 25.5123Z" fill="white"/>
					<path d="M75.0325 24.5416V32.1251C75.0325 32.2215 74.9568 32.2972 74.8606 32.2972H70.9925C70.8962 32.2972 70.8206 32.2215 70.8206 32.1251V11.2163C70.8206 11.1199 70.8962 11.0442 70.9925 11.0442H78.7046C84.0958 11.0442 87.2281 13.4745 87.2281 17.6914C87.2281 21.9082 84.0958 24.3729 78.7046 24.3729H75.2044C75.1081 24.3729 75.0325 24.4487 75.0325 24.5451V24.5416ZM78.5361 20.9272C81.5687 20.9272 83.1193 19.9151 83.1193 17.6879C83.1193 15.4607 81.5687 14.4831 78.5361 14.4831H75.2044C75.1081 14.4831 75.0325 14.5588 75.0325 14.6552V20.755C75.0325 20.8514 75.1081 20.9272 75.2044 20.9272H78.5361Z" fill="white"/>
					<path d="M91.3335 32.1285V28.7963C91.3335 28.7 91.4091 28.6242 91.5054 28.6242H96.8245C96.9207 28.6242 96.9964 28.5485 96.9964 28.4521V14.8927C96.9964 14.7963 96.9207 14.7206 96.8245 14.7206H91.5054C91.4091 14.7206 91.3335 14.6449 91.3335 14.5485V11.2163C91.3335 11.1199 91.4091 11.0442 91.5054 11.0442H106.73C106.826 11.0442 106.902 11.1199 106.902 11.2163V14.5485C106.902 14.6449 106.826 14.7206 106.73 14.7206H101.415C101.318 14.7206 101.243 14.7963 101.243 14.8927V28.4487C101.243 28.5451 101.318 28.6208 101.415 28.6208H106.73C106.826 28.6208 106.902 28.6965 106.902 28.7929V32.1251C106.902 32.2215 106.826 32.2972 106.73 32.2972H91.5054C91.4091 32.2972 91.3335 32.2215 91.3335 32.1251V32.1285Z" fill="white"/>
					<path d="M125.276 24.934V11.2163C125.276 11.1199 125.352 11.0442 125.448 11.0442H128.945C129.041 11.0442 129.117 11.1199 129.117 11.2163V32.1251C129.117 32.2215 129.041 32.2972 128.945 32.2972H125.341C125.28 32.2972 125.221 32.2628 125.19 32.2077L116.632 16.7206C116.546 16.5657 116.309 16.6277 116.309 16.8032V32.1251C116.309 32.2215 116.233 32.2972 116.137 32.2972H112.64C112.544 32.2972 112.469 32.2215 112.469 32.1251V11.2163C112.469 11.1199 112.544 11.0442 112.64 11.0442H117.354C117.416 11.0442 117.475 11.0786 117.506 11.1337L124.953 25.0132C125.039 25.1716 125.276 25.1096 125.276 24.9306V24.934Z" fill="white"/>
					</svg>   
				<h1>Key Value Store Explorer</h1>             
			</div>
			<!-- Nav -->
			<div id="n-container">
				<nav id="navbar">
					<header></header>
					<a class="nav-link" href="../../">
						<i class="fa-arrow-left fa-sharp fa-solid" aria-hidden="true"></i> 
						Back to my app</a>
					<a class="nav-link" href="./kv-explorer/">
						<i class="fa-table-list fa-sharp fa-solid" aria-hidden="true"></i> 
						Key Value Store</a>
					<a class="nav-link nav-link-bottom" href="https://developer.fermyon.com/spin" target="_blank"> 
						<i class="fa-sharp fa-solid fa-book" aria-hidden="true"></i> 
						Documentation
					</a>
				</nav>
			</div>
		</div>
	
		<div id="m-container">
			<main id="main-doc">
				<section class="main-section" id="kv-explorer">
	
					<div class="row">
						<div class="col-md-9">
				
							<div class="table-wrap">
								<div class="row mb-2 add-kv">
									<div class="col-md-6">
										<input id="keyInput" type="text" class="form-control" placeholder="Key">
									</div>
									<div class="col-md-5">
										<input id="valueInput" type="text" class="form-control" placeholder="Value">
									</div>
									<div class="col-md-1">
										<button id="add" class="btn btn-outline-primary" title="Add"><i class="fa-sharp fa-solid fa-plus"></i></button>
									</div>
								</div>
								
								<table class="table table-striped table-dark" id="kv">
									<thead class="thead-dark">
										<tr>
											<th>Key</th>
											<th>Value</th>
										</tr>
									</thead>
									<tbody>
									
									</tbody>
								</table>
								
							</div>
	
						</div>
						<div class="col-md-3 about-kv">
							<h4>About Key Value Storage</h4>
							<p>This is a storage option for applications that need data in the form of key/value pairs and are satisfied by a BASE consistency model. Workload examples include general value caching, session caching, counters, and serialized application state.</p>
							<p><a href="https://developer.fermyon.com/spin/kv-store#the-spin-toml-file" target="_blank">Configuring a Key Value store</a> for your Spin application allows you to <code>POST</code> and <code>GET</code> &mdash; read the docs for <a href="https://developer.fermyon.com/spin/kv-store#storing-and-retrieving-data-from-your-default-keyvalue-store" target="_blank">Storing &amp; Retrieving Data From Your Default Key/Value Store</a> for guidance and examples.</p>
						</div>
					</div>
	
				</section>
			</div>
	
		</div>
	
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
			fetch("/internal/kv-explorer/api/stores/default")
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
					<td><a href="#" id="\${key}View" class="btn btn-outline-secondary view-btn" data-key="\${key}"> View </a>  <a href="#" id="\${key}Delete" class="btn btn-outline-secondary delete-btn" data-key="\${key}">Delete</a ></td>
						</tr>\`);
	
				$(\`#\${key}View\`).click(function () {
					var key = $(this).data("key");
					fetch(\`/internal/kv-explorer/api/stores/default/keys/\${key}\`).then((response) => response.json()).then((data) => {
						let decoder = new TextDecoder();
						let value = decoder.decode(new Uint8Array(data.value));
						$("#valueContent").text(value);
						$("#viewModal").modal("show");
					});
				});
	
	
				$(\`#\${key}Delete\`).click(function () {
					var key = $(this).data("key");
					fetch(\`/internal/kv-explorer/api/stores/default/keys/\${key}\`, {
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
				fetch("/internal/kv-explorer/api/stores/default", {
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
	</html>
`
}
