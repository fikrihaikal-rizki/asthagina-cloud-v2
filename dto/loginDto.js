export default function (data) {
  return {
    username: data.body.username,
    password: data.body.password,
  }  
}
