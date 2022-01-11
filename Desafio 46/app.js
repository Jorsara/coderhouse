const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const app = new Koa();

const router = new Router({
    prefix: '/cars'
})
app.use(router.routes());
app.use(koaBody());

let cars = [];

router.post('/', koaBody(), (ctx, next) =>{
    if(
        !ctx.request.body.marca || 
        !ctx.request.body.modelo || 
        !ctx.request.body.anio 
    ){
        ctx.response.status = 400;
        ctx.body = {
            status: 'error',
            message: 'Ingresa todos los campos'
        }
    }else{
        const newCar = {
            marca: ctx.request.body.marca,
            modelo: ctx.request.body.modelo,
            anio: ctx.request.body.anio
        };
        cars.push(newCar);
        
        ctx.response.status = 201;
        ctx.body = {
            status: 'success',
            message: `Se agrego correctame el auto: ${ctx.request.body.marca}, ${ctx.request.body.modelo}, ${ctx.request.body.anio}`
        };
    }
    next();
});

router.get('/', (ctx, next) =>{
    ctx.body = {
        status: 'success',
        message: cars
    };
    next();
})

app.listen(8080);