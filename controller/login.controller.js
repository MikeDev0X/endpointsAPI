const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
/////////
const mysql = require('mysql');
const mysqlConfig = require('../helpers/mysql-config');
const { NULL } = require('mysql/lib/protocol/constants/types');
const conexion = mysql.createConnection(mysqlConfig);
const crypto = require('crypto');
const { resolveAny } = require('dns');
////////

module.exports.login = (req, res) => {

    const user = req.body.user;
    const password = req.body.password;
    const sql = `SELECT idUsuario FROM usuario WHERE nickname = ?`
        //const sql2 = `SELECT SHA2(contrasena,224) FROM usuario WHERE nickname=?`
    const sql2 = `SELECT contrasena FROM usuario WHERE nickname=? `

    //const sql3 = `SELECT contrasena FROM usuario WHERE contrasena = SHA2(?,224)`
    let idUsuario;
    let resultUser;
    let resultPassword;

    let mensaje = 'Usuario o contraseña inválidos' //mensaje updated

    ////////////////
    let token = '';

    const payload = {
        id: 1,
        user: req.body.user
    }

    console.log(req.body);

    function Fun(pw) {

        conexion.query(sql, [user], (error, results, fields) => {
            if (error)
                res.send(error);
            else {
                //console.log(results[0]); //undefined
                if (results[0] != undefined) {

                    resultUser = results[0];
                    idUsuario = resultUser.idUsuario;

                    conexion.query(sql2, [user], (error, results2, fields) => {

                        if (error)
                            res.send(error);
                        else {
                            resultPassword = results2[0];

                            //////////7
                            let pwd = pw;
                            pwd = crypto.createHash('sha224')
                                .update(pwd)
                                .digest('hex');
                            console.log(pwd);

                            ///////////

                            //56
                            //16

                            //console.log(resultPassword);

                            //console.log(resultUser);

                            if (resultUser != undefined) {
                                console.log(resultPassword);

                                if (resultPassword.contrasena === pwd) {

                                    token = jwt.sign(payload, config.key, { expiresIn: 7200 })
                                    mensaje = 'Usuario o contraseña autenticados'

                                }
                            }
                        }

                        res.json({
                            mensaje,
                            token,
                            idUsuario
                        })
                    })

                } else {
                    res.json({
                        mensaje
                    })
                }

            }
        })
    }

    Fun(password);
}

module.exports.updatePassword = (req, res) => {
    const sql = `UPDATE usuario SET contrasena = SHA2(?,224) WHERE idUsuario = ?`;
    const sql2 = `SELECT idUsuario FROM usuario WHERE idUsuario = ?`
    const newPw = req.params.contrasena;
    const idUsuario = req.params.idUsuario;
    let mensaje = "Password couldn't be updated, there was an error";

    conexion.query(sql2, [idUsuario], (error, results, fields) => {
        if (error) {
            res.send(error)
        } else {
            if (results[0] != undefined) { //idUsuario exists
                conexion.query(sql, [newPw, idUsuario], (error, results, fields) => {

                    if (error)
                        res.send(error)
                    else {
                        console.log(req.params);
                        mensaje = "Password updated successfully";
                        res.json({
                            results,
                            mensaje
                        })

                        // a7470858e79c282bc2f6adfd831b132672dfd1224c1e78cbf5bcd057
                        // 
                        // 565911e4c943a39e9f89edc0a22c71b73fb7a535914e9696c4f3fb12

                    }
                })
            } else {
                mensaje = "User doesn't exist";
                res.json({
                    mensaje
                })

            }

        }


    })

}

module.exports.getUserId = (req,res) =>{
    const sql = `SELECT idUsuario FROM usuario WHERE nickname = ?`;
    const nickname = req.params.nickname;
    let mensaje = "User doesn't exist";
    let idUsuario;

    conexion.query(sql, [nickname], (error,results,fields)=>{
        if(error)
            res.send(error)
        else{
            if(results[0]==undefined){
                res.json({
                    mensaje
                })
            }
            else{
                mensaje = "idUsuario found correctly"
                idUsuario = results[0].idUsuario;

                res.json({
                    mensaje,
                    idUsuario    
                })
            }
        }


    })


}