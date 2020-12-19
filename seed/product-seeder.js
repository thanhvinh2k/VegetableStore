var product = new require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:0joIlgGzoKMMEagE@cluster0.adn4g.mongodb.net/FreshVegetablemanager?retryWrites=true&w=majority', 
 {
    useNewUrlParser: true, 
    useFindAndModify: false,
    useUnifiedTopology: true,
}, function (err) {
  if (err) {
    console.log("Mongoose connect err" + err)
  } else {
    console.log("Mongoose connected successful")
  }
});

var products = [
    new product({
        Image: 'https://image.thanhnien.vn/1080/uploaded/ngocthanh/2016_10_30/bi1_mrdv_xnzz.jpg',
        cateId: 'rau ăn củ',
        Name: 'Qủa bí đỏ',
        Price: 25000,
        typeBuy: '',
        Description: 'Tốt cho tim mạch',
        Storage: '',
        Origin: '',
        Usage: '',
    }),
    new product({
        Image: 'https://image.thanhnien.vn/1080/uploaded/kieuoanh/2018_11_23/strawberryshutterstock_77474803_xkyz_lsiq.jpg',
        CateId: 'quả mọng',
        Name: 'Qủa dâu tây',
        Price: 35000,
        typeBuy: '',
        Description: 'Dâu tây cũng giống như các loại quả mọng khác, chứa chất xơ hòa tan giúp bạn cảm thấy vị ngọt tự nhiên, thanh mát, hương vị độc đáo nên có thể dùng để chế biến những món ăn vừa ngon vừa tốt cho sức khỏe.',
        Storage: '',
        Origin: '',
        Usage: '',
    }),
    new product({
        Image: 'https://image.thanhnien.vn/1080/uploaded/ngocthanh/2016_10_30/bi1_mrdv_xnzz.jpg',
        CateId: 'rau ăn củ',
        Name: 'Qủa bí đỏ',
        Price: 25000,
        typeBuy: '',
        Description: 'Dâu tây cũng giống như các loại quả mọng khác, chứa chất xơ hòa tan giúp bạn cảm thấy vị ngọt tự nhiên, thanh mát, hương vị độc đáo nên có thể dùng để chế biến những món ăn vừa ngon vừa tốt cho sức khỏe.',
        Storage: '',
        Origin: '',
        Usage: '',
    }),
    new product({
        Image: 'https://trongraulamvuon.vn/upload/user/images/sau-benh-dua-leo.jpg',
        CateId: 'rau ăn quả',
        Name: 'Qủa dưa leo',
        Price: 15000,
        typeBuy: '',
        Description: 'Quả dưa leo chứa nhiều nước và chứa protid, lipid, carbohydrat, Ca, Fe, Mg, P; các vitamin nhóm B (B1, B2, niacin); vitamin C và A. Hạt có dầu béo và protid, saponin, hypoxanthin (có tác dụng trừ giun) và cucurbitacin (có tác dụng chống u bướu).',
        Storage: '',
        Origin: '',
        Usage: '',
    }),
    new product({
        Image: 'https://lh3.googleusercontent.com/proxy/B_7TbIukvLTgDsR8Y1B71v42QFXA0rRfhWS1pep8yEY2Dst2CfWy_s7GI5SZiGd-6Yy3nwyHCHmx1xJJVamnv_EaZ9OqzSsaHQDtpUR20ctbJOVkkQ',
        CateId: 'rau ăn lá',
        Name: 'Bắp cải',
        Price: 20000,
        typeBuy: '',
        Description: 'Bắp cải chứa nhiều nước và chứa protid, lipid, carbohydrat, Ca, Fe, Mg, P; các vitamin nhóm B (B1, B2, niacin); vitamin C và A. Hạt có dầu béo và protid, saponin, hypoxanthin (có tác dụng trừ giun) và cucurbitacin (có tác dụng chống u bướu).',
        Storage: '',
        Origin: '',
        Usage: '',
    }),
];

done = 0 ; 
for(var i = 0 ; i < products.length; i++){
    products[i].save( function(err, result){
        done++;
        if(done === products.length){
            exits();
        }
    } );
}

function exits(){
    mongoose.disconnect();
}