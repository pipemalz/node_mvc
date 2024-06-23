fetch('http://localhost:3000/movies')
  .then(res => res.json())
  .then(data => console.log(data))
