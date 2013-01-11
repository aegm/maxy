var ItemsData = new Class
({
	selectedIndex: 0,
	selectedItem: null,
	items: [],
	currentItems:[],
	tempItems:[],
	mode:null,
	created:false,

	initialize: function(_mode)
	{
		this.mode=_mode;
	},

	addItem: function(_item,_urlPrefix,_reffilter)
	{
		this.items.push(new ItemData(_item, this.items.length,_reffilter));
	},

	setInitialCurrentItems:function()
	{
		for(var i=0; i<this.items.length; i++){
			this.currentItems.push(this.items[i]);
		}
	},
	removeCurrentItems:function()
	{
		this.currentItems.empty();
	},

	setMode:function(_mode)
	{
		this.mode=_mode;
	},

	findItemById:function(_id)
	{
		for(var i=0; i<this.items.length; i++){
			if(this.items[i].id == _id)
			{
				return this.items[i];
			}
		}
	}


});

var ItemData = new Class
({
	item:null,
	index:null,
	reffilter:null,
	id:null,
	name: null,
	numPrice:null,
	oldPrice:null,
	imagepreview:null,
	imagefull:null,
	imagemodel:null,
	link:null,
	urlPrefix:null,
	isNew:false,
	features:[],
	colors:[],
	sizes:[],
	prefix:'grid_',
	data:null,
	colorimages:[],
	model:false,

	initialize: function(_item,_index,_filter)
	{

		this.reffilter=_filter;
		this.index=_index;
		this.id=_item.id;
		this.name=_item.name;
		this.numPrice = _item.curPrice;
		this.oldPrice= _item.oldPrice;
		this.imagepreview= _item.image.standard;
		this.imagefull= _item.image.zoom;
		this.imagemodel= _item.image.model;
		this.features= _item.attr.feature;
		this.colors= _item.attr.color;
		this.sizes= _item.attr.size;
		this.link= _item.link.full;
		this.isNew = (_item.isNew == 1)? true:false;
		this.colorimages= _item.colorImages;
		this.model = (this.imagemodel!=undefined);
		this.item=_item;

		//A�adimos el precio a los filtros
		this.reffilter.feedFilter(this.numPrice);
	},


	filterContainsArray:function(_arrayFilter,_arrayDataItem){
		var res=false;
		if(_arrayFilter.length<=0)
		{
			res = true;
		}
		else
		{
			for(var j=0; j<_arrayDataItem.length; j++)
			{
				if(_arrayFilter.contains(_arrayDataItem[j]))
				{
					res = true;
				}
			}
		}
		return res;
	},
	filterContainsString:function(_arrayFilter,_dataItem){
		var res=false;
		if(_arrayFilter.length<=0)
		{
			res = true;
		}
		else
		{
			/*if(_arrayFilter.contains(_dataItem.toString()) )
			{
				res = true;
			}*/
			for(var i=0;i<_arrayFilter.length;i++){
				//if(_arrayFilter[i].toInt() >= _dataItem.toInt()) res = true;
				if(parseFloat(_arrayFilter[i]) >= parseFloat(_dataItem)) res = true;
			}
		}
		return res;
	},
	filter:function()
	{
		if(this.filterContainsArray(this.reffilter.currentfeatures,this.features) && this.filterContainsArray(this.reffilter.currentcolors,this.colors) && this.filterContainsArray(this.reffilter.currentsizes,this.sizes) && this.filterContainsString(this.reffilter.currentprices,this.numPrice)){return true;}
		else{return false;}
	},
	filterFuture:function()
	{
		if(this.filterContainsArray(this.reffilter.futurefeatures,this.features) && this.filterContainsArray(this.reffilter.futurecolors,this.colors) && this.filterContainsArray(this.reffilter.futuresizes,this.sizes) && this.filterContainsString(this.reffilter.futureprices,this.numPrice)){/*alert(this.name);*/return true;}
		else{return false;}
	},
	checkActualFilterFutureItems:function(i,_filter)
	{
		var result=false;
		switch (i) {
			case 0:
				if(this.features.contains(_filter)) result=true;
			break
			case 1:
				if(this.colors.contains(_filter)) result=true;
			break
			case 2:
				if(this.sizes.contains(_filter)) result=true;
			break
			default:
				if(this.numPrice <= _filter) ;result=true;
		}
		return result;
	}

});var Grid = new Class
({
	Implements: Events,
	element: null,
	avscroll:null,
	selectedIndex: 0,
	selectedItem: null,
	items: [],
	currentItems:[],
	tempItems:[],
	picloaded:-1,
	picToBegin:-1,
	topToLoad:0,
	totalpics:0,
	prefix:'grid_',
	proccess:true,
	loadMoreElements:true,
	mySlider:null,
	model:false,
	modelMode:false,
	marginRight:15,
	marginRightModel:15,
	marginRightProduct:65,
	itemsinrow:5,
	data:null,
	barHeights:0,
	cargado:false,
	itemWidth:0,
	minWidth:180,
	maxWidth:275,
	minWidthModel:180,
	minWidthProduct:140,
	maxWidthModel:275,
	maxWidthProduct:160,
	previousCurrentItems:0,
	filterItemsFlag:false,
	colorUrlSuffix:"",

	initialize: function(_element,_parent,_filter,_data,_modelMode)
	{
		this.element = _element;
		this.outer = _parent;
		this.filter = _filter;
		this.modelMode = _modelMode;
		this.data=_data;

		this.maxWidth = (this.modelMode)?this.maxWidthModel:this.maxWidthProduct;
		this.minWidth = (this.modelMode)?this.minWidthModel:this.minWidthProduct;
		this.marginRight = (this.modelMode)?this.marginRightModel:this.marginRightProduct;
		this.barHeights = $('layout_bottom').getSize().y + $('layout_top').getSize().y + this.filter.element.getSize().y;
	},
	setMode:function(_modelMode)
	{
		this.modelMode=_modelMode;
	},

	addItem: function(_item,_urlPrefix)
	{
		this.items.push(new GridItem(this,this.filter, this.items.length, _item,_urlPrefix));
	},
	addItems: function()
	{
		for(var i=0; i<this.data.items.length; i++){

			this.items.push(new GridItem(this,this.filter,this.data.items[i]));
		}
	},

	loadItemPic:function()
	{
		if(this.proccess==true)
		{
			//if(this.picloaded<this.currentItems.length-1)
			if(this.picloaded<this.picToBegin) this.picloaded=this.picToBegin;
			if(this.picloaded<this.topToLoad-1)
			{
				this.picloaded = this.picloaded+1;
				this.currentItems[this.picloaded].loadItemPic();
			}
			else
			{
				this.picToBegin = this.picloaded;
				this.resize(false);
			}
		}
	},



	addLast:function()
	{
		var last=new Element('div', {
			'class':'clear'
		});
		this.element.store('last',last);
		this.element.adopt(last);

		for(var i=0; i<this.items.length; i++){
			this.currentItems.push(this.items[i]);
		}
		this.data.setInitialCurrentItems();

		this.refreshFromFilter();

		//this.loadItemPic();
		this.cargado=true;
	},

	addScroll:function()
	{
		var areaknob =new Element('div', {
		'id':'grid_areaknob',
		'class':'scrBarYbold'
		});
		($('layout_back')).adopt(areaknob);

		var knob =new Element('div', {
			'id':'grid_knob',
			'class':'scrKnobYbold'
		});
		areaknob.adopt(knob);

		areaknob.setStyle('height',(window.getSize().y-this.barHeights-40)+'px');
		this.avscroll = new customScrollbar(($('grid_innerContainer')),areaknob,knob,false);
		//this.avscroll.sld.addEvent("change",this.checkScrollToLoadImages.bind(this));
		this.avscroll.sld.addEvent("complete",this.checkScrollToLoadImages.bind(this));
		this.resize();
	},

	refreshFromFilter:function()
	{
		this.removeItemsFromDom();
		this.filterItems();
		this.filterItemsFlag=true;
		this.addItemsToDom();
	},
	removeItemsFromDom:function(){
		this.proccess=false;

		this.element.retrieve('last').dispose();
		//Eliminamos todos los items del DOM
		for(var i=0; i<this.currentItems.length; i++){
			this.currentItems[i].element.dispose();
		}
		for(var i=0; i<this.items.length; i++){
			this.items[i].element.get("tween").cancel();
			this.items[i].element.fade('hide');
		}
		//Vaciamos la lista de items actual, los items graficos de esta clase, y los items de datos de DataItems
		this.currentItems.empty();
		this.data.removeCurrentItems();

		if(this.avscroll!=null)this.avscroll.sld.set(0);

	},
	filterItems:function()
	{
		for(var k=0; k<this.items.length; k++)
		{
			if( this.items[k].data.filter() )
			{
				this.currentItems.push(this.items[k]);
				this.data.currentItems.push(this.data.items[k]);
			}
		}
	},
	addItemsToDom:function()
	{
		//Añade los items que cumplen el filtro al DOM
		for(var i=0; i<this.currentItems.length; i++)
		{
			this.element.adopt(this.currentItems[i].element);
			this.currentItems[i].data.index=i;
		}

		var last=new Element('div', {
			'class':'clear'
		});
		this.element.store('last',last);
		this.element.adopt(last);

		this.proccess=true;
		this.picloaded=-1;
		this.picToBegin=-1;

		this.maxWidth = (this.modelMode)?this.maxWidthModel:this.maxWidthProduct;
		this.minWidth = (this.modelMode)?this.minWidthModel:this.minWidthProduct;
		this.marginRight = (this.modelMode)?this.marginRightModel:this.marginRightProduct;

		this.resize();
	},
	destroyAll:function(){
		this.proccess=false;
		($('grid_areaknob')).destroy();
		for(var i=0;i<this.items.length;i++)
		{
			this.items[i].element.get("tween").cancel();
			this.items[i].element.destroy();
		}
		this.outer.destroy();
		this.avscroll.sld.removeEvents();
		delete this.avscroll;
		delete this.items;

		this.selectedIndex= 0;
		this.selectedItem= null;
		this.picloaded=-1;
		this.picToBegin=-1;
	},

	destroyAlmostAll:function(){
		this.proccess=false;
		($('grid_areaknob')).destroy();
		for(var i=0;i<this.items.length;i++){
			this.items[i].element.get("tween").cancel();
			this.items[i].element.destroy();
		}
		this.element.destroy();
		this.avscroll.sld.removeEvents();
		delete this.avscroll;

		this.currentItems.empty();
		this.items.empty();

		this.selectedIndex= 0;
		this.selectedItem= null;
		this.picloaded=-1;
		this.picToBegin=-1;
	},

	filterFutureItems:function()
	{
		this.tempItems.empty();
		for(var k=0; k<this.items.length; k++){
			if( this.items[k].data.filterFuture())
			{
				this.tempItems.push(this.items[k]);
			}
		}
		return(this.tempItems.length);

	},
	checkActualFilterFutureItems:function(i, _filter)
	{
		var result=0;
		for(var k=0; k<this.tempItems.length; k++){
			if( this.tempItems[k].data.checkActualFilterFutureItems(i,_filter))
			{
				result=result+1;
			}
		}
		return(result);
	},

	checkScrollToLoadImages:function(e)
	{
		this.loadMoreElements=true;
		this.calculateItemsOnViewport();
		this.calculateShowLoading();
	},
	calculateShowLoading:function()
	{
	},
	iniMargins:function()
	{
		var scrollMode =null;
		if (this.avscroll!=null)
		{
			if(this.avscroll.isActive()) scrollMode =65;
			else scrollMode =40;
		}
		else scrollMode =40;
		this.calculateItemsInRow(scrollMode);
		this.calculateItemsOnViewport();
	},

	calculateItemsInRow:function(scrollMode)
	{
		if(this.modelMode)
		{
			var maxWidth  = this.maxWidth + this.marginRight;
			var minWidth  = this.minWidth + this.marginRight;
			var width = (window.getSize().x-scrollMode + this.marginRight);
			this.itemWidth =  Math.floor(width / this.itemsinrow);

			if(this.itemWidth>maxWidth)
			{
				this.itemsinrow++;
				this.calculateItemsInRow(scrollMode);
			}
			else
			{
				this.itemWidth = this.itemWidth - this.marginRight;
			}
		}
		else
		{
			this.itemWidth =  this.minWidth;
			this.itemsinrow = Math.floor(  (window.getSize().x-scrollMode) / (this.itemWidth+40));
			this.marginRight = (window.getSize().x-scrollMode) - (this.itemWidth*this.itemsinrow);
			this.marginRight = Math.floor(this.marginRight/(this.itemsinrow-1));
		}
	},

	calculateItemsOnViewport:function()
	{
		var itemHeight=0;
		if(this.modelMode)
				itemHeight = Math.round(this.itemWidth / (180/230) );
			else
				itemHeight = this.itemWidth;
		itemHeight = itemHeight +90;

		var _topToLoad = 0;
		var fila = 0;
		var act = 1;
		for(var i=0;i<this.currentItems.length;i++)
		{
			if(fila*itemHeight <  $('grid_innerContainer').getSize().y  +$('grid_innerContainer').getScrollTop() + (2*itemHeight))
			{
				_topToLoad++;
			}
			if(act<this.itemsinrow)
			{
				act++;
			}
			else
			{
				act=1;
				fila++;
			}
		}
		if(	(this.loadMoreElements && this.topToLoad !=_topToLoad) ||
			(this.loadMoreElements && this.previousCurrentItems !=this.currentItems.length)||
			(this.filterItemsFlag && this.previousCurrentItems ==this.currentItems.length) )
		{
			this.filterItemsFlag=false;
			this.previousCurrentItems = this.currentItems.length;
			this.topToLoad =_topToLoad;
			this.picloaded = -1;
			this.loadItemPic();
		}

	},
	resize: function(_loadMore)
	{
		if(_loadMore!=null) this.loadMoreElements=_loadMore;
		this.itemsinrow=5;
		this.outer.setStyle('height',(window.getSize().y-this.barHeights-20)+'px');
		this.outer.setStyle('width',(window.getSize().x)+'px');
		this.element.setStyle('height',(window.getSize().y-this.barHeights-40)+'px');


		if (this.avscroll!=null) this.avscroll.resize();
		this.element.setStyle('max-height',(window.getSize().y-this.barHeights-40)+'px');
		this.iniMargins();

		for(var i=0; i<this.currentItems.length; i++){
			this.currentItems[i].scalePic();
		}

		if (this.avscroll!=null) this.avscroll.resize();


		if($('iframe_product'))
		{
			($('iframe_product')).setStyle('height',(window.getSize().y-85)+"px");
		}
		this.loadMoreElements=true;
	},
	show: function()
	{
		this.visible=true;
		this.element.setStyle('display','');
	},
	hide: function()
	{
		this.visible=false;
		this.element.setStyle('display','none');
	},

	trace:function(s)
	{
		($('trace')).setProperty('text',s);
	},

	showProductDetail:function()
	{
		this.proccess=false;
		this.outer.setStyle('display','none');
		($('grid_areaknob')).setStyle('display','none');
		this.filter.setProductMode(true);
		this.filter.setNavigationBarMode();
		this.filter.setNavigationBarProducts();
		this.filter.resetMark(this.filter.mode);
		var iframe = ($('iframe_product'));
		iframe.setStyle('display', '');
		iframe.setStyle('height', (window.getSize().y - 85) + "px");
	},
	showAllProducts:function(dontUpdateHash)
	{
		this.filter.setProductMode(false);
		this.filter.setNavigationBarMode();
		this.filter.setNavigationBarProducts();
		this.filter.setMark(this.filter.mode);
		obContainer.outer.setStyle('display','');

		if(typeof(dontUpdateHash) == 'undefined'){
			hashListener.updateHash('#');
		}

		if($('iframe_product') != null)
			($('iframe_product')).destroy();
	},
	loadOnIframe:function(urlToLoad)
	{
		ItxAnalytics.setSource("Cat_" +$(document.body).get('data-ga-logic').substring(1).replace(/\//g,'_'));
		$('iframe_product').setProperty('src',urlToLoad);
		//($('iframe_product')).setProperty('src','http://192.168.0.77/pullstore/web/Navigation/Main/ItxProductView.jsp');
	},
	mainShowProductDetail:function(_id)
	{
		if(_id!=undefined)
		{
			var dataItemByParameter = this.data.findItemById(_id);
			var urllink = dataItemByParameter.link;
			this.selectedIndex=dataItemByParameter.index;
			//hashListener.updateHash("/"+obContainer.currentItems[obContainer.selectedIndex].data.id+"/"+obContainer.currentItems[obContainer.selectedIndex].data.name);
			this.showProductDetail();
			ItxAnalytics.setSource("Cat_" +$(document.body).get('data-ga-logic').substring(1).replace(/\//g,'_'));
			$('iframe_product').setProperty('src',urllink + this.colorUrlSuffix);
			//$('iframe_product').setProperty('src','http://192.168.0.77/pullstore/web/Navigation/Main/ItxProductView.jsp');
		}
	}

});



var GridItem = new Class
	({
	carrusel: null,
	index: null,
	prefix:'grid_',
	data:null,
	picloaded:false,
	urlPrefix:null,
	element:null,
	newIcon:null,
	ratio:null,

	initialize: function(_grid,_filter,_dataItem)
	{
		this.data=_dataItem;
		this.grid=_grid;
		//Añadimos elementos al DOM
		this.createElements();
	},

	createElements:function()
	{

		//AÑADIMOS CONTENEDOR DE ELEMENTO
		this.element=new Element('a', {
			'class':this.prefix+'itemContainer',
			//'href':obProductsGrid.urlPrefix+"#/"+this.data.id+"/"+this.data.name  /*DESARROLLO*/
			//'href':obProductsGrid.urlPrefix+obProductsGrid.categoryId+"/#/"+this.data.id+"/"+this.data.name /*PRODUCCION  A PARRILLA*/
			'href':this.data.link /*PRODUCCION A PRODUCTO*/
		});
		this.element.store('imgContainer', this);

		//AÑADIMOS LA IMAGEN
		var imgCont=new Element('div', {
			'class':this.prefix+'imageContainer'
		});

		var el=this.element;
		var owner=this;
		var img = new Element('img',{
			'class':this.prefix+'imagencarrusel',
			events: {
				error: function() {
					owner.picloaded =true;
					el.fade(1);//Fade in del item
					owner.grid.loadItemPic();//Carga la siguiente foto
				}.bind(this),
				load: function() {
					//Hacemos la comprobacion de si hemos abandonado la carga del foto(para ir a un producto a otro modo de vista)
					//Si nos hemos ido no asignamos la carga porque el contenedor está oculto y no se respetan las proporciones.
					if(owner.grid.proccess==true && !owner.picloaded)
					{
						owner.ratio = img.width / img.height;
						if(owner.data.isNew)
						{
							owner.newIcon =new Element('img',{'src':jspStoreImgDir+'img/ShopCart/new_icon.png','class':'grid_isNewIcon'}).inject(imgCont);
						}
						owner.loadMoreIcons();

						owner.picloaded =true;
						owner.scalePic();//posiciona la foto
						el.fade(1);//Fade in del item
						owner.grid.loadItemPic.delay(0,owner.grid);//Carga la siguiente foto
					}
				}.bind(this)
			}
		});
		this.element.fade('hide');
		imgCont.store('img',img);
		imgCont.adopt(img);
		this.element.store('imgCont',imgCont);
		this.element.adopt(imgCont);


		//AÑADIMOS CONTENEDOR DE NOMBRES ,COLORES Y PRECIOS
		var texto=new Element('div', {
			'class':this.prefix+'containerItemData'
		});
		this.element.store('text',texto);
		this.element.adopt(texto);

		//AÑADIMOS CONTENEDOR DE COLORES
		var colors=new Element('div', {
			'class':this.prefix+'colors'
		});
		for(var i=0; i<this.data.colorimages.length; i++){
			//solo mostramos los 6 primeros colores
			if(i<6)
			{
				var colorpic = owner.data.colorimages[i];
				//AÑADIMOS LA IMAGEN DE COLOR
				var imgcolor=new Element('img', {
					'class':this.prefix+'imgcolor',
					'src':obProductsGrid.imgPrefix+colorpic
				});
				colors.store('img'+i,imgcolor);
				colors.adopt(imgcolor);

				this.loadPictureByColor(imgcolor,obProductsGrid.imgPrefix+colorpic);
			}
		}
		//AÑADIMOS TITULO
		var name=new Element('div', {
			'class':this.prefix+'name',
			'text':this.data.name
		});

		texto.adopt(colors);
		texto.adopt(name);
		this.element.store('name',name);

		var oldPrice;
		var newPrice;
		var price;
		if (Number(this.data.oldPrice)>Number(this.data.numPrice)){
			oldPrice=new Element('div', {
				'class':this.prefix+'oldprice',
				'html':currency.format(this.data.oldPrice)
			});

			var newPrice = new Element('div', {
				'class':this.prefix+'newprice',
				'html':currency.format(this.data.numPrice)
			});

			texto.adopt(newPrice);
			texto.adopt(oldPrice);
		}
		else{
			price=new Element('div', {
				   'class':this.prefix+'price',
				   'html':currency.format(this.data.numPrice)
			});
			   texto.adopt(price);
		}
		this.grid.element.adopt(this.element);
		texto.setStyle('height',texto.getSize().y+1 );
		this.addEvents();
	},

	loadMoreIcons:function()
	{
		if(typeof specialForItalySpecialItemsArray!="undefined")
		{
			if(StoreLocatorJSON.country=="IT")
			{
				if(specialForItalySpecialItemsArray.contains(this.data.item.ref.split("-")[0]))
				{
					if (!this.grid.modelMode)
					{
						var specialitalyicon =new Element('img',{'src':staticContentPath+'/img/SpecialForItaly/icon.gif','class':'grid_isNewProduct'}).inject(this.element.retrieve('imgCont'));
						specialitalyicon.setStyles({"top":8,"left":this.grid.itemWidth - 35});
					}
					else
					{
						 var specialitalyicon =new Element('img',{'src':staticContentPath+'/img/SpecialForItaly/icon_difum.gif','class':'grid_isNewModel'}).inject(this.element.retrieve('imgCont'));
						specialitalyicon.setStyles({"top":8,"left":this.grid.itemWidth - 35});
					}
				}
			}
		}
	},

	loadPictureByColor:function(_imgcolor,_url)
	{
		_imgcolor.addEvent("click",function(e)
		{
			var colorRefPos = _url.indexOf('_');
			this.grid.colorUrlSuffix = '?reload='+Math.random()+'#'+_url.substring(colorRefPos-3,colorRefPos);

			var img = this.element.retrieve('imgCont').retrieve('img');
			var url_change= (this.grid.modelMode)?_url.replace('3_1_5','4_1_3'):_url.replace('3_1_5','1_1_4');
			var url_prev= this.element.retrieve('imgCont').retrieve('img').get("src");
			var imgLoader = new Image();
			imgLoader.onload=function()
			{
				img.src = imgLoader.src;
			};
			e.stop();
			imgLoader.src = url_change;
		}.bind(this));

	},


	loadItemPic:function()
	{
		if(this.picloaded==false)
		{
			if (!this.grid.modelMode)
			{
				this.element.retrieve('imgCont').retrieve('img').set('src',obProductsGrid.imgPrefix+this.data.imagepreview);
			}
			else
			{
				this.element.retrieve('imgCont').retrieve('img').set('src',obProductsGrid.imgPrefix+this.data.imagemodel.replace("1_4.jpg","1_3.jpg"));
			}
		}
		else
		{
			//this.element.fade.delay(50*this.grid.picloaded,this.element,1);
			this.element.fade.delay(50,this.element,1);
			this.grid.loadItemPic();//Carga la siguiente foto
		}
	},

	scalePic:function()
	{
		if(this.picloaded)
		{
			if(this.grid.modelMode)
				containerheight = Math.round(this.grid.itemWidth / (180/230));
				//containerheight = Math.round(this.grid.itemWidth / this.ratio);
			else
				containerheight = this.grid.itemWidth;

			this.element.retrieve('imgCont').setStyle('height',containerheight+'px');
			this.element.retrieve('imgCont').setStyle('width',this.grid.itemWidth+'px');

			var diff;
			if(this.ratio<1)
			{
				this.element.retrieve('imgCont').retrieve('img').setStyle('height',containerheight+'px');
				this.element.retrieve('imgCont').retrieve('img').setStyle('width',(containerheight * this.ratio)+"px");
				diff = this.element.retrieve('imgCont').getStyle('height').toInt()-this.element.retrieve('imgCont').retrieve('img').getStyle('height').toInt();
				this.element.retrieve('imgCont').retrieve('img').setStyle('top',diff+"px");
			}
			else
			{
				this.element.retrieve('imgCont').retrieve('img').setStyle('width',this.grid.itemWidth+'px');
				this.element.retrieve('imgCont').retrieve('img').setStyle('height',(this.grid.itemWidth/this.ratio)+"px");
				diff = this.element.retrieve('imgCont').getStyle('height').toInt()-this.element.retrieve('imgCont').retrieve('img').getStyle('height').toInt();
				this.element.retrieve('imgCont').retrieve('img').setStyle('top',diff+"px");
			}

			if(this.newIcon!=null)
				this.newIcon.setStyles({"top":containerheight - 35,"left":this.grid.itemWidth - 35});

			var realIndex=this.grid.currentItems.indexOf(this);
			this.resize(realIndex);
		}
	},

	resize:function(index)
	{
		var marginbottom = 0;
		this.element.retrieve('text').setStyle('width',this.grid.itemWidth+'px');
		this.element.setStyle('margin-top',0+'px');
		marginbottom = this.element.retrieve('imgCont').getSize().y + 90 - this.element.getStyle('height').toInt();

		//Calculamos si el elemento pertecene a la ultima fila y le damos margen 0 para que el scroll se ajuste a sangre
		var tope = Math.floor(this.grid.currentItems.length/this.grid.itemsinrow) * this.grid.itemsinrow;
		if(tope==this.grid.currentItems.length) tope = tope - this.grid.itemsinrow;
		if( index>=tope )
		{
			marginbottom=0;
		}
		this.element.setStyle('margin-bottom',marginbottom+"px");

		//Calculamos si el elemento pertecene a la ultima columna y le damos margen 0
		if( (index+1)%this.grid.itemsinrow !=0 )
		{
			this.element.setStyle('margin-right',this.grid.marginRight+'px');
		}
		else
		{
			this.element.setStyle('margin-right','0px');
		}
	},


	addEvents:function()
	{
		var urllink = this.data.link;
		this.element.addEvent('click',function(e){
			e.preventDefault();
			obContainer.selectedIndex = this.data.index;
			hashListener.updateHash("/" + obContainer.currentItems[obContainer.selectedIndex].data.id + "/" + obContainer.currentItems[obContainer.selectedIndex].data.name);
			ItxAnalytics.setSource("Cat_" +$(document.body).get('data-ga-logic').substring(1).replace(/\//g,'_'));
			return false;
		}.bind(this));
		this.element.addEvent('mouseenter',function(){
			this.element.retrieve('name').setStyle('text-decoration','underline');
		}.bind(this));
		this.element.addEvent('mouseleave',function(){
			this.element.retrieve('name').setStyle('text-decoration','none');
		}.bind(this));
	}
});var CarrouselItem = new Class
({
    element:null,
    parent:null,
    item:null,
    imagen:null,
    preview:null,
    container:null,
    box:null,
    position:null,
    size:null,
    horizontal:null,
    data:null,
    imageloader:null,
    previewloader:null,
    ratiopreview:0,
    ratioimage:0,
    previewheight:140,
    imageloaded:false,
    previewloaded:false,

    initialize:function(_data,_index,_parent,_filter)
    {
        this.data=_data;
        this.parent=_parent;

        this.element=new Element('div',{'class':'item'});

        this.container=new Element('div',{'class':'container'});
        this.element.adopt(this.container);

        this.imagen=new Element('img');
        this.preview=new Element('img');
        this.imagen.fade('hide');
        this.preview.fade('hide');

        this.addEvents();
        this.data.created=true;
        return(this);
    },
    loadImage:function()
    {
        if(!this.imageloaded && !this.previewloaded){
            if(!this.previewloaded){

                this.previewloader = new Image();
                this.previewloader.onload = function()
                {
                    this.preview.src = this.previewloader.src;
                    this.horizontal=this.previewloader.width > this.previewloader.height;
                    this.ratiopreview = this.previewloader.width / this.previewloader.height;
                    if(this.horizontal)
                    {
                        this.preview.setStyle('width',this.parent.width + "px");
                        this.preview.setStyle('height',(this.parent.width/this.ratiopreview) + "px");
                    }
                    else
                    {

                        this.preview.setStyle('height',this.parent.width + "px");
                        this.preview.setStyle('width',(this.parent.width * this.ratiopreview) + "px");
                    }
                    this.container.adopt(this.preview);
                    this.previewloaded=true;
                    this.preview.fade('show');
                    if(this.data.index==0 && this.imageloaded){this.parent.resize();this.parent.addSlider();}
                    //if(this.data.index==0){this.parent.resize();this.parent.addSlider();}
                    //this.parent.loadImages();
                }.bind(this);
                this.previewloader.src = obProductsGrid.imgPrefix+this.data.imagepreview;

            }
            if(!this.imageloaded){

                this.imageloader = new Image();
                this.imageloader.onload = function()
                {
                    this.imagen.src = this.imageloader.src;
                    this.horizontal= this.imageloader.width > this.imageloader.height;
                    this.ratioimage = this.imageloader.width / this.imageloader.height;
                    if(this.horizontal)
                    {
                        this.imagen.setStyle('width',this.parent.width+"px");
                    }
                    else
                    {
                        this.imagen.setStyle('height',this.parent.width+"px");
                    }
                    this.container.adopt(this.imagen);
                    this.imageloaded=true;
                    this.imagen.fade('show');
                    this.parent.element.adopt(this.element);
                    if(this.data.index==0 && this.previewloaded){this.parent.resize();this.parent.addSlider();}
                    this.parent.loadImages();
                }.bind(this);
                this.imageloader.src = obProductsGrid.imgPrefix+this.data.imagefull;
            }
        }
        else{
            this.parent.loadImages();
            this.imagen.fade(1);
            this.preview.fade(1);
            if(this.data.index==0 && this.previewloaded){this.parent.resize();this.parent.addSlider();}
        }

    },
    loadImageFull:function()
    {
        if(!this.imageloaded)
        {

            this.imageloader = new Image();
            this.imageloader.onload = function()
            {
                this.imagen.src = this.imageloader.src;
                this.horizontal= this.imageloader.width > this.imageloader.height;
                this.ratioimage = this.imageloader.width / this.imageloader.height;
                if(this.horizontal)
                {
                    this.imagen.setStyle('width',this.parent.width+"px");
                }
                else
                {
                    this.imagen.setStyle('height',this.parent.width+"px");
                }
                this.container.adopt(this.imagen);
                this.imageloaded=true;
                this.imagen.fade('show');
                this.parent.element.adopt(this.element);
            }.bind(this);
            this.imageloader.src = obProductsGrid.imgPrefix+this.data.imagefull;
        }
    },
    addEvents:function()
    {
        this.element.store('Object',this);
        var self=this;
        this.element.addEvent('click',function(e)
        {
            e.stop();
            if(this.retrieve('Object').parent.selectedIndex==this.retrieve('Object').data.index)
            {
                hashListener.updateHash("/"+obContainer.currentItems[obContainer.selectedIndex].data.id+"/"+obContainer.currentItems[obContainer.selectedIndex].data.name);
                self.parent.showProductDetail();
                ItxAnalytics.setSource("Cat_" +$(document.body).get('data-ga-logic').substring(1).replace(/\//g,'_'));
                $('iframe_product').setProperty('src',this.retrieve('Object').data.link);
            }
            else
            {
                this.retrieve('Object').parent.select(this.retrieve('Object').data.index);
            }
        });

        var fx1=new Fx.Tween(this.preview);
        var fx2=new Fx.Tween(this.preview);

        this.preview.addEvent('mouseenter',function()
        {
            if(!this.horizontal)
            {
                fx1.start('height',this.parent.width + (this.parent.width/10)+"px");
                fx2.start('width',((this.parent.width + (this.parent.width/10)) * this.ratiopreview)+"px");
            }
            else{
                fx1.start('width',this.parent.width + (this.parent.width/10)+"px");
                fx2.start('height',( (this.parent.width + (this.parent.width/10)) / this.ratiopreview)+"px");
            }
        }.bind(this));
        this.preview.addEvent('mouseleave',function()
        {
            if(!this.horizontal)
            {
                fx1.start('height',this.parent.width+"px");
                fx2.start('width',((this.parent.width) * this.ratiopreview)+"px");
            }
            else{
                fx1.start('width',this.parent.width +"px");
                fx2.start('height',( (this.parent.width ) / this.ratiopreview)+"px");
            }
        }.bind(this));

        this.imagen.addEvent('mouseenter',function()
        {
            this.parent.rollSelected(true);
        }.bind(this));
        this.imagen.addEvent('mouseleave',function()
        {
            this.parent.rollSelected(false);
        }.bind(this));
    },
    updatePosition:function(_position, _size, _instant)
    {
        this.position=_position;
        this.size=_size;
        if(_instant)
        {
            this.container.setStyle('width',_size+"px");
            this.element.setStyle('left',_position+"px");
            if(!this.horizontal)
            {
                if(this.ratiopreview!=0 && this.ratiopreview!=null && this.ratiopreview!=undefined)
                {
                    this.preview.setStyle('height',_size+"px");
                    this.imagen.setStyle('height',_size+"px");
                    this.preview.setStyle('width',(_size * this.ratiopreview)+"px");
                    this.imagen.setStyle('width',(_size * this.ratiopreview)+"px");
                }
            }
            else
            {
                if(this.ratiopreview!=0 && this.ratiopreview!=null && this.ratiopreview!=undefined)
                {
                    this.preview.setStyle('width',_size+"px");
                    this.imagen.setStyle('width',_size+"px");
                    this.preview.setStyle('height',(_size / this.ratiopreview)+"px");
                    this.imagen.setStyle('height',(_size / this.ratiopreview)+"px");
                }
            }
        }
        else
        {
            //if(_size==this.parent.maxSize) alert("elegido:"+this.data.index+"::"+_size + "::"+this.ratiopreview);
            this.container.tween('width',_size+"px");
            this.element.tween('left',_position+"px");

            var fx1=new Fx.Tween(this.imagen);
            var fx2=new Fx.Tween(this.imagen);
            var fx3=new Fx.Tween(this.preview);
            var fx4=new Fx.Tween(this.preview);

            if(!this.horizontal)
            {
                if(this.ratiopreview!=0 && this.ratiopreview!=null && this.ratiopreview!=undefined)
                {
                    fx1.start('height',_size+"px");
                    fx2.start('width',(_size * this.ratiopreview)+"px");
                    fx3.start('height',_size+"px");
                    fx4.start('width',(_size * this.ratiopreview)+"px");
                }
            }
            else{
                if(this.ratiopreview!=0 && this.ratiopreview!=null && this.ratiopreview!=undefined)
                {
                    fx1.start('width',_size+"px");
                    fx2.start('height',(_size / this.ratiopreview)+"px");
                    fx3.start('width',_size+"px");
                    fx4.start('height',(_size / this.ratiopreview)+"px");
                }
            }
        }
    }
});
var Carrousel=new Class
({
    element:null,
    infoElement:null,
    items:[],
    currentItems:[],
    tempItems:[],
    selectedIndex:0,
    margin:50,
    verticalMargin:120,
    width:140,
    maxMaxSize:900,
    maxSize:540,
    windowWidth:null,
    windowHeight:null,
    infoHeight:null,
    infoMargin:20,
    reffilter:null,
    slider:null,
    sliderObject:null,
    data:null,
    picloaded:-1,
    isFlash:false,
    flashComp:null,
    barsHeight:105,
    compLoaded:false,


    initialize:function(_element,_infoElement,_filter, _data)
    {
        this.infoElement=_infoElement;
        this.infoElement.setStyle('display','');
        this.infoHeight=this.infoElement.getSize().y;
        this.element=_element;
        this.reffilter=_filter;
        this.data =_data;
        this.isFlash = Browser.Plugins.Flash && (Browser.Plugins.Flash.version > 8);
        //this.isFlash=false;

        this.addInfoEvents();
        this.infoElement.fade('hide');
    },

    /**************************************************************************************************************************/
    /** FUNCIONES PARA LA VERSION HTML **/
    addSlider:function()
    {
        var arrarTemp = (this.currentItems.length!=0)? this.currentItems:this.items;
        var needScroll = (arrarTemp.length-1>0)
        if(needScroll)
        {
            this.slider=new Element('div',{'id':'carrousel_slider','class':'scrBarXBold'});
            this.slider.addEvent('mousedown',function()
            {
                lockBottomMenu=true;
                $(document.body).addEvent('mouseup',function()
                {
                    lockBottomMenu=false;
                    this.removeEvents('mouseup');
                });
            });
            this.slider.adopt(new Element('div',{'class':'scrKnobXBold'}));
            this.element.getParent().adopt(this.slider);

            this.sliderObject=new Slider(this.slider, this.slider.getElement('.scrKnobXBold'),
            {
                'range': [0, arrarTemp.length-1],
                'wheel': true,
                'initialStep':0,
                'onChange': function(value)
                {

                }
            });
            this.sliderObject.addEvent("onChange",function(value)
                {
                    obContainer.select(value);
                });
        }

        /*resizeController.addFunction(function(){
            mySlider.autosize();
        });*/
    },
    addItem:function(_item,_index)
    {
        var newItem=new CarrouselItem(_item,_index,this,this.reffilter);
        this.items.push(newItem);
        this.element.adopt(newItem.element);
    },
    addItems:function()
    {
        for(var i=0; i<this.data.items.length; i++){
            this.items.push(new CarrouselItem(this.data.items[i],i,this,this.filter));
        }
    },
    loadImages:function()
    {
        if(this.picloaded<this.currentItems.length-1)
        {
            var num =  this.picloaded+1;
            this.picloaded = this.picloaded+1;
            this.currentItems[num].loadImage();
        }
        //En Internet explorer sale un stack overflow en el carrusel html. Se deriva de cargar imagen, esperar, cargar siguiente. Si sustituimos lo de arriba por este for..funciona, aunque no es la mejor solucion.
        /*for(var i=0;i<this.currentItems.length;i++)
        {
            this.currentItems[i].loadImage();
        }*/

    },
    select:function(_index,_instant)
    {
        this.infoElement.fade('hide');
        this.selectedIndex=_index;
        var _sizeAct=0;
        this.currentItems.each(function(item,index)
        {
            var relIndex=index-this.selectedIndex;
            var newPos=(this.windowWidth)/2;
            if(relIndex>0)
            {
                item.imagen.setStyle('display','none');
                item.preview.setStyle('display','');
                newPos+=this.maxSize/2+relIndex*(this.width+this.margin)-this.width;
            }
            else if(relIndex<0)
            {
                item.imagen.setStyle('display','none');
                item.preview.setStyle('display','');
                newPos+=-this.maxSize/2+relIndex*(this.width+this.margin);
            }
            else
            {
                item.imagen.setStyle('display','');
                item.preview.setStyle('display','none');
                newPos-=this.maxSize/2;
            }
            var newSize=(relIndex==0)?this.maxSize:this.width;
            item.updatePosition(newPos,newSize,_instant);
        }
        ,this);

        this.reffilter.setNavigationBarProducts();
        this.setInfoProduct(_index);
        if(this.sliderObject!=null)this.sliderObject.setSliderDimensions().setKnobPosition(this.sliderObject.toPosition(this.selectedIndex));


        var posInfo=0;
        var altoreal=0;
        if(this.items[this.selectedIndex].horizontal==true){
            altoreal = this.maxSize/this.items[this.selectedIndex].ratioimage;
            posInfo = this.verticalMargin+altoreal+50;
        }
        else
        {
            altoreal = this.maxSize/this.items[this.selectedIndex].ratioimage;
            posInfo=this.verticalMargin+this.maxSize;
        }
        this.infoElement.setStyle('top',posInfo+"px");
        this.infoElement.fade(1);
    },


    resizeHTML:function()
    {
        this.windowWidth=window.getSize().x;
        this.windowHeight=window.getSize().y;
        this.maxSize=this.windowHeight-this.barsHeight-this.verticalMargin*2;
        if(this.maxSize>this.maxMaxSize) this.maxSize=this.maxMaxSize;

        this.element.setStyle('top',this.verticalMargin+"px"); //Lo colocamos al canto de el filtro
        this.element.setStyle('height',this.maxSize+"px");//Le damos todo el alto menos las barras

        this.infoElement.setStyle('top',this.verticalMargin+this.maxSize+"px");

        if(this.sliderObject!=null)
        {
            this.sliderObject.autosize();
        }
        this.select(this.selectedIndex,true);
    },
    refreshFromFilterHTML:function()
    {
        this.removeItemsFromDom();
        this.filterItems();
        this.addItemsToDom();
    },
    removeItemsFromDom:function(){

        //Eliminamos todos los items del DOM
        for(var i=0; i<this.currentItems.length; i++){
            this.currentItems[i].element.dispose();
        }
        for(var i=0; i<this.items.length; i++){
            //this.items[i].element.fade('hide');
        }
        //Vaciamos la lista de items actual
        this.currentItems.empty();
        this.data.removeCurrentItems();
        if(this.slider!=null){
            this.slider.destroy();
            this.sliderObject=null;
        }
    },
    addItemsToDom:function()
    {
        //A?ade los items que cumplen el filtro al DOM
        for(var i=0; i<this.currentItems.length; i++){
            this.element.adopt(this.currentItems[i].element);
            this.currentItems[i].data.index=i;
            //this.currentItems[i].element.fade(1);
            this.currentItems[i].element.setStyle('display','');
        }

        this.picloaded=-1;
        this.selectedIndex=0;
        this.loadImages();
    },

    /**************************************************************************************************************************/
    /**FUNCIONES PARA EL FLASH***/
	createFlashContainer:function()
	{
		$('carrousel').setStyle('display','');
		var self=this;
		this.flashComp = $(new Swiff(jspStoreImgDir+'swf/carrousel.swf?ver='+new Date().getTime(),
		{
			id:'swiffCarrousel',
			width:  550,
			height: 400,
			container: $('carrousel'),
			params:
			{
				allowScriptAccess: 'always',
				wMode:'opaque'
			},
			callBacks:
			{
				'onLoad': function() {
					self.addFlashItems();
				},
				'selectItem':function(index){
					self.setInfoProduct(index);
				},
				'rollitem':function(over){
					self.rollSelected(over);
				},
				'finTransSelect':function(altofoto,posfoto){
					self.finSelectFlash(altofoto,posfoto);
				},
				'addSlider':function(){
					self.addSliderFlash();
				},
				'hideInfoElement':function(){
					self.hideInfo();
				},
				'jumpToProduct':function(_index){
					self.loadProductFromFlash(_index);
				}
			}
		}));
	},

    addFlashItems:function()
    {
	this.flashComp.focus();
        for(var i=0; i<this.data.items.length; i++)
	{
            var item ={};
            item.imagepreview = this.data.items[i].imagepreview;
            item.imagefull = this.data.items[i].imagefull;
            item.index = this.data.items[i].index;
            item.data = this.data.items[i];
            this.items.push(item);
        }

        if(isCategoryInitializing)fnInitializeFilter();
        this.filterItems();//Es importante filtrar aqu? para crear los curentItems. Es el equivalente  de refreshFromFilter en el grid o el carrusel HTML.
        if(isCategoryInitializing){fnLoadProductIntoCategories();isCategoryInitializing=false;obFilter.setNavigationBarProducts();}

        for(var j=0;j<this.currentItems.length; j++)
	{
            this.flashComp.createCarruselItemCall(obProductsGrid.imgPrefix+this.currentItems[j].data.imagepreview , obProductsGrid.imgPrefix+this.currentItems[j].data.imagefull , this.currentItems[j].data.index);
        }
        this.flashComp.setLength(MessageLabels.viewProduct);
        this.resize();
        this.flashComp.loadNextPic();
    },
    hideInfo:function()
    {
        this.infoElement.get("tween").cancel();
        this.infoElement.fade('hide');
    },
    finSelectFlash:function(altofoto,posfoto)
    {
        if(!obFilter.productMode){
            this.infoElement.setStyle('top',(30+this.verticalMargin + posfoto + ((this.maxSize-altofoto-this.infoHeight)/2) + altofoto+ this.infoMargin)+"px");
            this.infoElement.get("tween").cancel();
            this.infoElement.fade(1);
            this.sliderObject.setSliderDimensions().setKnobPosition(this.sliderObject.toPosition(this.selectedIndex));
            this.infoElement.setStyle('display','');
        }
        //this.addWheelEvent(true);
    },
    resizeFlash:function()
    {
        this.windowWidth=window.getSize().x;
        this.windowHeight=window.getSize().y;
        this.maxSize=this.windowHeight-this.barsHeight-this.verticalMargin*2;
        if(this.maxSize>this.maxMaxSize) this.maxSize=this.maxMaxSize;

        this.element.setStyle('top',"31px"); //Lo colocamos al canto de el filtro
        this.element.setStyle('height',this.windowHeight-90+"px");//Le damos todo el alto menos las barras
        this.element.setStyle('width',this.windowWidth+"px");//Le damos todo el alto menos las barras

        this.infoElement.setStyle('top',this.verticalMargin+this.maxSize+"px");

        this.flashComp.width = this.windowWidth;
        this.flashComp.height = this.windowHeight-this.barsHeight;
        this.flashComp.escalar(this.windowWidth,this.maxSize, this.windowHeight-90, (this.infoHeight+this.infoMargin));
        if(this.sliderObject!=null)this.sliderObject.autosize();
    },
    addSliderFlash:function()
    {
        this.slider=new Element('div',{'id':'carrousel_slider','class':'scrBarXBold'});
        this.slider.addEvent('mousedown',function()
        {
            lockBottomMenu=true;
            $(document.body).addEvent('mouseup',function()
            {
                lockBottomMenu=false;
                this.removeEvents('mouseup');
            });
        });
        this.slider.adopt(new Element('div',{'class':'scrKnobXBold'}));
        this.element.getParent().adopt(this.slider);

        this.sliderObject=new Slider(this.slider, this.slider.getElement('.scrKnobXBold'),
        {
            'range': [0, this.currentItems.length-1],
            'wheel': false,

            'onChange': function(value)
            {
                //obContainer.setInfoProduct(value);
                //obContainer.flashComp.selectSlider(value);

            },
            'onComplete': function(value)
            {
                //obContainer.setInfoProduct(value);
                //obContainer.flashComp.select(value);

            }
        });
        this.sliderObject.addEvent("onChange",function(value)
        {
            obContainer.setInfoProduct(value);
            obContainer.flashComp.selectSlider(value);
        });
        this.sliderObject.addEvent("onComplete",function(value)
        {
            obContainer.setInfoProduct(value);
            obContainer.flashComp.select(value);
        });

        /*this.element.addEvent('mousewheel',function(event){
                event = new Event(event);
                obContainer.flashComp.onWheel(event.wheel);
        });*/

        this.slider.addEvent('mousedown',function(){
                obContainer.flashComp.gridAllocate();
        });
        this.slider.addEvent('mouseup',function(){
                obContainer.setInfoProduct(obContainer.selectedIndex);
                obContainer.flashComp.select(obContainer.selectedIndex);
        });

    },

    addWheelEvent:function(b)
    {
        if(b){
            this.element.addEvent('mousewheel',function(event){
                obContainer.addWheelEvent(false);
                event = new Event(event);
                obContainer.flashComp.onWheel(event.wheel);
            });
        }
        else{
            this.element.removeEvents('mousewheel');
        }
    },

    loadProductFromFlash:function(_index)
    {
	hashListener.updateHash("/"+obContainer.currentItems[obContainer.selectedIndex].data.id+"/"+obContainer.currentItems[obContainer.selectedIndex].data.name);
	this.showProductDetail();
	ItxAnalytics.setSource("Cat_" +$(document.body).get('data-ga-logic').substring(1).replace(/\//g,'_'));
	 $('iframe_product').setProperty('src',this.currentItems[this.selectedIndex].data.link);
    },


    refreshFromFilterFlash:function()
    {
        this.removeItemsFromFlash();
        this.filterItems();
        this.addItemsToFlash();
    },
    removeItemsFromFlash:function(){
        //Vaciamos la lista de items actual
        this.currentItems.empty();
        this.data.removeCurrentItems();
        this.flashComp.deleteItems();
        this.infoElement.get("tween").cancel();
        this.infoElement.fade('hide');
    },
    addItemsToFlash:function()
    {
        for(var i=0; i<this.currentItems.length; i++){
            this.flashComp.createCarruselItemCall(obProductsGrid.imgPrefix+this.currentItems[i].data.imagepreview , obProductsGrid.imgPrefix+this.currentItems[i].data.imagefull , this.currentItems[i].data.index);
        }
        //this.sliderObject.setRange([0, this.currentItems.length-1]);
        this.slider.destroy();
        this.sliderObject=null;
        this.flashComp.setLength();
        this.resize();
        this.flashComp.loadNextPic();

    },

    destroyAllFlash:function(){
        $('carrousel').setStyle('display','none');
        this.slider.destroy();
    },

    /**************************************************************************************************************************/
    /**FUNCIONES COMUNES CON FLASH Y SIN FLASH***/
    setInfoProduct:function(_index)
    {
        this.selectedIndex=_index;
        this.infoElement.getElementById('colors').empty();

        if (Number(this.currentItems[_index].data.oldPrice)>Number(this.currentItems[_index].data.numPrice)){
            this.infoElement.getElementById('oldprice').set('html',currency.format(this.currentItems[_index].data.oldPrice));
            this.infoElement.getElementById('newprice').set('html',currency.format(this.currentItems[_index].data.numPrice));
            this.infoElement.getElementById('price').setStyle('display','none');
            this.infoElement.getElementById('oldprice').setStyle('display','');
            this.infoElement.getElementById('newprice').setStyle('display','');
        }
        else{
            this.infoElement.getElementById('price').set('html',currency.format(this.currentItems[_index].data.numPrice));
            this.infoElement.getElementById('newprice').setStyle('display','none');
            this.infoElement.getElementById('oldprice').setStyle('display','none');
            this.infoElement.getElementById('price').setStyle('display','');
        }
        if(this.currentItems[_index].data.isNew)
        {
            this.infoElement.getElementById('isNew').set('html','NEW');
            this.infoElement.getElementById('isNew').setStyle('display','');
        }
        else
        {
            this.infoElement.getElementById('isNew').setStyle('display','none');
            this.infoElement.getElementById('isNew').set('html','');
        }

        this.currentItems[_index].data.colorimages.each(function(item,index)
        {
            //solo mostramos los 6 primeros colores
            if(index<6) obContainer.infoElement.getElementById('colors').adopt(new Element('img',{'class':'imgColor','src':obProductsGrid.imgPrefix+item}));
        });
        this.infoElement.getElementById('name').set('text',this.currentItems[_index].data.name);

        if(this.isFlash)
        {
            this.infoElement.get("tween").cancel();
            this.infoElement.fade('hide');
        }

        this.reffilter.setNavigationBarProducts();
    },

    rollSelected:function(over)
    {
        if(over)
        {
            $('carrouselInfo').getElement('#name').setStyle('text-decoration','underline');
        }
        else
        {
            $('carrouselInfo').getElement('#name').setStyle('text-decoration','none');
        }
    },

    addInfoEvents:function()
    {
        $('carrouselInfoBlock').addEvent('mouseenter',function()
        {
            $('carrouselInfo').getElement('#name').setStyle('text-decoration','underline');
        });
        $('carrouselInfoBlock').addEvent('mouseleave',function()
        {
            $('carrouselInfo').getElement('#name').setStyle('text-decoration','none');
        });
        $('carrouselInfoBlock').addEvent('click',function()
        {
		hashListener.updateHash("/"+obContainer.currentItems[obContainer.selectedIndex].data.id+"/"+obContainer.currentItems[obContainer.selectedIndex].data.name);
		this.showProductDetail();
		ItxAnalytics.setSource("Cat_" +$(document.body).get('data-ga-logic').substring(1).replace(/\//g,'_'));
		 $('iframe_product').setProperty('src',this.items[this.selectedIndex].data.link);
        }.bind(this));
    },
    selectItemFromBarFilter:function(b)
    {
        if(this.isFlash)this.selectItemFromBarFilterFlash(b);
        else this.selectItemFromBarFilterFlash(b);
    },
    selectItem:function(_index)
    {
        this.setInfoProduct(_index);
        if(this.isFlash)this.flashComp.select(_index);
        else this.select(_index);
    },

    selectItemFromBarFilterFlash:function(b)
    {
        var selectedind=0;
        if (b==true)
        {
            if(this.selectedIndex<this.currentItems.length-1)
            {
                selectedind=this.selectedIndex.toInt()+1;
                this.selectItem(selectedind);
            }
        }
        else{
            if(this.selectedIndex>0)
            {
                selectedind = this.selectedIndex.toInt()-1;
                this.selectItem(selectedind);
            }
        }
    },

    setCurrentItems:function()
    {
        for(var i=0; i<this.items.length; i++){
            this.currentItems.push(this.items[i]);
        }
    },
    resize:function()
    {
        if(this.isFlash)this.resizeFlash();
        else this.resizeHTML();
	if(($('iframe_product')) !== null){
            ($('iframe_product')).setStyle('height',((window.getSize().y-85)+"px"));
        }
    },
    refreshFromFilter:function()
    {
        if(this.isFlash)this.refreshFromFilterFlash();
        else this.refreshFromFilterHTML();
    },

    filterItems:function()
    {
        for(var k=0; k<this.items.length; k++){
            if( this.items[k].data.filter() )
            {
                this.currentItems.push(this.items[k]);
                this.data.currentItems.push(this.data.items[k]);
            }
        }
    },
    filterFutureItems:function()
    {
        this.tempItems.empty();
        for(var k=0; k<this.items.length; k++){
            if( this.items[k].data.filterFuture())
            {
                this.tempItems.push(this.items[k]);
            }
        }
        return(this.tempItems.length);

    },
    checkActualFilterFutureItems:function(i, _filter)
    {
        var result=0;
        for(var k=0; k<this.tempItems.length; k++){
            if( this.tempItems[k].data.checkActualFilterFutureItems(i,_filter))
            {
                result=result+1;
            }
        }
        return(result);

    },
    destroyAllHTML:function(){
        $('carrousel').setStyle('display','none');
        for(var i=0;i<this.items.length;i++){
            this.items[i].element.destroy();
        }
        if(this.sliderObject!=null)this.slider.destroy();
    },
    destroyAll:function(){
        if(this.isFlash)this.destroyAllFlash();
        else this.destroyAllHTML();
    },
    destroyAlmostAll:function(){
        if(this.isFlash)this.destroyAllFlash();
        else this.destroyAllHTML();
    },
    showProductDetail:function()
    {
        if($('carrousel_slider')!=null) ($('carrousel_slider')).setStyle('display','none');
        $('carrousel').setStyle('left',"5000px");
        this.infoElement.get("tween").cancel();
        this.infoElement.fade('hide');
        this.infoElement.setStyle('display','none');
        this.reffilter.setProductMode(true);
        this.reffilter.setNavigationBarMode();
        this.reffilter.setNavigationBarProducts();
        this.reffilter.resetMark(this.reffilter.mode);
        ($('iframe_product')).setStyle('display','');
        ($('iframe_product')).setStyle('height',(window.getSize().y-85)+"px");
    },
    showAllProducts:function(dontUpdateHash)
    {
        $('carrousel').setStyle('left',"0px");
        this.reffilter.setProductMode(false);
        this.reffilter.setNavigationBarMode();
        this.reffilter.setNavigationBarProducts();
        this.reffilter.setMark(this.reffilter.mode);
        $('carrousel').setStyle('display','');
        this.infoElement.setStyle('display','');
        if($('carrousel_slider')!=null) ($('carrousel_slider')).setStyle('display','');
         if(typeof(dontUpdateHash) == 'undefined'){
            hashListener.updateHash('#');
        }
        if($('iframe_product') != null)
        {
            ($('iframe_product')).destroy();
        }
    },
    mainShowProductDetail:function(_id)
    {
        if(_id!=undefined)
        {
    		var dataItemByParameter = this.data.findItemById(_id);
    		var urllink = dataItemByParameter.link;
    		this.selectedIndex=dataItemByParameter.index;
    		hashListener.updateHash("/"+obContainer.currentItems[obContainer.selectedIndex].data.id+"/"+obContainer.currentItems[obContainer.selectedIndex].data.name);
    		ItxAnalytics.setSource("Cat_" +$(document.body).get('data-ga-logic').substring(1).replace(/\//g,'_'));
    		$('iframe_product').setProperty('src',urllink);
    		this.showProductDetail();
        }
    },
    loadOnIframe:function(urlToLoad)
    {
        ItxAnalytics.setSource("Cat_" +$(document.body).get('data-ga-logic').substring(1).replace(/\//g,'_'));
        $('iframe_product').setProperty('src',urlToLoad);
    }

});

var obContainer;//CLASE PARA EL FILTRO
var Filter = new Class
({
    mode:null,
    modelMode:null,
    productMode:false,
    isVisible:false,
    element:null,

    families:[],
    prices:[],
    features:[],
    colors:[],
    sizes:[],

    featuresnames:[],
    colorsnames:[],
    sizesnames:[],

    currentprices:[],
    currentfeatures:[],
    currentcolors:[],
    currentsizes:[],

    futureprices:[],
    futurefeatures:[],
    futurecolors:[],
    futuresizes:[],

    futureactualarray:[],
    futureactualfilter:null,

    filters:[],
    currentfilters:[],
    futurefilters:[],
    tempfilters:[],

    filtersnames:[],
    heightFiltersSubMenus:[],
    scrollBarFilters:[],

    initialize: function(_element,_mode,_modelMode)
    {
        this.element = _element;
        this.mode = _mode;
        this.modelMode = _modelMode;
    },

    /**Se añaden los elementos al DOM. Primero los links a familias,luego los filtros, luego los modos de visualizacion (ver todos, carrusel, ver producto)
     *y luego los botones centrales(adelante, atras y volver).
     *Se comprueba que filtros hay que activar con checkFutureItems
     *Se comprueba si se muestra el botón de limpiar filtros.
     **/
    addElements:function()
    {
        $('topFilterMenuBar').setStyle('display','none');
        this.addLinkElements();
        if(!isCategorySearchResult) this.addFilterElements();
        this.addResultSearchBar();
        this.addViewmodeElements();
        this.addNavigationElements();
        if(!isCategorySearchResult)this.checkFutureItems();
        if(!isCategorySearchResult)this.checkClearFilters();
        this.hideshow.delay(1);
        this.addKeyEventListeners();
        this.showFilterScroll();

    },

    hideshow:function()
    {
        $('topFilterMenuBar').setStyle('display','none');
        $('topFilterMenuBar').setStyle('display','');
    },

    /**Se añaden los elementos de Link a otras familias
     *Se cogen los links del TOPMENUJSON
     **/
    addLinkElements:function()
    {
        var filterContainer = new Element('div', {'class':'topFilter_filter_container'}).inject(this.element);
        var filtrar=new Element('div', {'class':'topFilter_menu_option'}).inject(filterContainer);
        var textofiltrar = new Element('span', {'class':'topFilter_menu_option_header','html':'<b>'+MessageLabels.filter+'</b>'}).inject(filtrar);
        this.element.store('filterContainer',filterContainer);
    },
    /**Se añaden las cuatro familias de filtros, Tipo, Color, Talla y precio
    */
    addFilterElements:function()
    {
        //Se crean 3 arrays bidimendionales. Uno que contiene los arrays de filtros, otro que contiene los arrays de filtros actuales y otro para los arrays de nombres.
        this.filters = [this.features,this.colors,this.sizes,this.prices];
        this.heightFiltersSubMenus = [0,0,0,0];
        this.currentfilters = [this.currentfeatures,this.currentcolors,this.currentsizes,this.currentprices];
        this.filtersnames = [this.featuresnames,this.colorsnames,this.sizesnames,this.prices];
        this.futurefilters = [this.futurefeatures,this.futurecolors,this.futuresizes,this.futureprices];

        for(var i=0; i<this.filters.length; i++)
        {
            var elemento;
            if(i>=0)
            {
                elemento=new Element('div', {'class':'topFilter_menu_separator', 'text':'|'});
                this.element.retrieve('filterContainer').adopt(elemento);
            }

            //var titulo=this.currentfilters[i][0];
            var titulo = this.getFilterName(i);

            elemento=new Element('div', {'class':'topFilter_menu_option'});

            var elementotexto=new Element('div', {'class':'topFilter_menu_option_header', 'text':titulo, 'value':"valor"});
            elemento.adopt(elementotexto);
            elemento.store('title',elementotexto);

            var deployer=new Element('img', {'class':'topFilter_menu_option_deployer', 'src':jspStoreImgDir+'img/filterbar/deployer.gif'});
            elementotexto.adopt(deployer);

            var self = this;
            var elementoWarp = new Element('div', {'class':'topFilter_menu_submenuWarp'});

            var elemento1 = new Element('div', {'class':'topFilter_menu_submenu'});

            this.filters[i].each(function(item,index)
            {
                (function(i){
                    var elemento2 = new Element('div', {'class':'topFilter_menu_submenu_option'});
                    var imgcheck = new Element('img', {'class':'topFilter_menu_submenu_option_check imgfiltergroup'+i, 'src':jspStoreImgDir+'img/filterbar/check_off.gif'}).inject(elemento2);
                    //Si es un precio se formatea
                    var elem_texto = null;
                    if(i == 3)
                    {
                        elem_texto = new Element('span', {'class':'topFilter_menu_submenu_option_text', 'html':MessageLabels.priceTo+" "+currency.format(self.filtersnames[i][index].toString())}).inject(elemento2);
                    }
                    else
                    {
                        elem_texto = new Element('span', {'class':'topFilter_menu_submenu_option_text', 'text':self.filtersnames[i][index]}).inject(elemento2);
                    }
                    imgcheck.store('selected',false);
                    elemento2.addEvent('mouseenter',function(){this.setStyle('background-color','#cccccc');});
                    elemento2.addEvent('mouseleave',function(){this.setStyle('background-color','');});
                    elemento2.addEvent('click',function(){self.updateCurrentFilters(item, self.currentfilters[i],imgcheck,i,index);});
                    elementoWarp.adopt(elemento2);
                    elementoWarp.store('filter'+index,elemento2);
                    elemento2.store('img',imgcheck);
                    elemento2.store('text',elem_texto);
                    //heightFiltersElements += self.convertCssPxToInt(elemento2.getSize().y);
                })(i);
            });

            elemento1.adopt(elementoWarp);
            elemento1.store('submenuWarp',elementoWarp);

            elemento.adopt(elemento1);
            elemento.store('submenu',elemento1);
            elemento.store('indexElemento',i);

            elemento.addEvent('mouseenter',function()
            {
                this.getElement('div.topFilter_menu_option_header').setStyle('background-color','#e1e1e1');
                this.getElement('div.topFilter_menu_submenu').setStyle('display','');

                if(self.heightFiltersSubMenus[this.retrieve('indexElemento')] == 0)
                {
                    self.heightFiltersSubMenus[this.retrieve('indexElemento')] = this.getElement('div.topFilter_menu_submenu').getSize().y;
                    self.checkFilterScrollByElement(this.retrieve('indexElemento'));
                }

                this.retrieve('submenuScrollBar').setPosition(0);
                this.retrieve('submenuScrollBar').resize();
                if(this.getPrevious('.topFilter_menu_separator')!=null) this.getPrevious('.topFilter_menu_separator').setStyle('visibility','hidden');
                if(this.getNext('.topFilter_menu_separator')!=null) this.getNext('.topFilter_menu_separator').setStyle('visibility','hidden');
                ($('topFilterMenuBar')).setStyle('background-color','#cccccc');
                activeTopMenuElement.removeClass('defaultActive');
                activeTopMenuElement.addClass('defaultActive2');
            });
            elemento.addEvent('mouseleave',function()
            {
                this.getElement('div.topFilter_menu_option_header').setStyle('background-color','');
                this.getElement('div.topFilter_menu_submenu').setStyle('display','none');
                if(this.getPrevious('.topFilter_menu_separator')!=null) this.getPrevious('.topFilter_menu_separator').setStyle('visibility','visible');
                if(this.getNext('.topFilter_menu_separator')!=null) this.getNext('.topFilter_menu_separator').setStyle('visibility','visible');
                ($('topFilterMenuBar')).setStyle('background-color','#e1e1e1');
                activeTopMenuElement.removeClass('defaultActive2');
                activeTopMenuElement.addClass('defaultActive');
            });
            elementotexto.addEvent('click',function()
            {
            });

            var clearAll = new Element('div', {'class':'topFilter_clearFamilyFilter_option topFilter_menu_submenu_option','text':MessageLabels.clean,'id':'topFilter_menu_submenu_option'+i}).inject(elemento1);
            clearAll.setStyle('background-image','url('+jspStoreImgDir+'img/filterbar/ico_refresh.gif)');
            clearAll.addEvent('mouseenter',function(){this.setStyle('background-color','#cccccc');});
            clearAll.addEvent('mouseleave',function(){this.setStyle('background-color','');});
            this.setClearFilters(i,clearAll);
            elemento.store("clearAll",clearAll);

            this.element.retrieve('filterContainer').adopt(elemento);
            this.element.store('filterblock'+i,elemento);

            var elementoSroll = new Element('div', {'class':'scrBarFilters'});
            var elementoSrollKnob = new Element('div', {'class':'scrKnobFilters'}).inject(elementoSroll);

            elemento1.adopt(elementoSroll);
            elemento1.store('submenuScroll', elementoSroll);
            this.scrollBarFilters.push(new customScrollbar(elementoWarp, elementoSroll, elementoSrollKnob, false));
            elemento.store('submenuScrollBar', this.scrollBarFilters[i]);

            this.heightFiltersSubMenus[i] = elemento.retrieve('submenu').retrieve('submenuWarp').retrieve('filter0').getStyle('height').toInt()*this.filters[i].length;

            elemento1.setStyle('display','none');
        }


        //Añadimos un separador y el elemento para limpiar todos los filtros, que solo se ven cuando hay filtros activos.
        var separador=new Element('div', {'class':'topFilter_menu_separator', 'text':'|'});
        this.element.retrieve('filterContainer').adopt(separador);
        this.element.retrieve('filterContainer').store("last_separator",separador);
        separador.setStyle('display','none');

        var clearAllElementWrap = new Element('div', {'class':'topFilter_menu_option','html':'&nbsp;&nbsp;&nbsp;&nbsp;'}).inject(this.element.retrieve('filterContainer'));
        clearAllElementWrap.setStyle('background-image','url('+jspStoreImgDir+'img/filterbar/ico_refresh.gif)');
        clearAllElementWrap.setStyle('background-repeat','no-repeat');
        clearAllElementWrap.setStyle('background-position','left center');
        clearAllElementWrap.setStyle('margin-left','10px');
        clearAllElementWrap.setStyle('_cursor','hand');
        clearAllElementWrap.setStyle('cursor','pointer');
        clearAllElementWrap.setProperty('title',MessageLabels.cleanAll);
        this.element.store('clearAllElementWrap',clearAllElementWrap);


        clearAllElementWrap.addEvent('click',function(){this.setClearAllFilters();}.bind(this));
    },
    addResultSearchBar:function()
    {
        var resultSearchBar = new Element('div', {'class':'topFilter_filter_container'}).inject(this.element);
        this.element.store('resultSearchBar',resultSearchBar);
        var contenedor = new Element('div', {'class':'topFilter_menu_option'}).inject(resultSearchBar);
        var textotitulo  = new Element('span', {'class':'topFilter_menu_option_header','html':'<b>'+MessageLabels.searchResults+':</b>'}).inject(contenedor);
        var textobusqueda  = new Element('span', {'class':'topFilter_menu_option_header','html':categorySearchResultText}).inject(textotitulo);
        textobusqueda.setStyle('padding-left','6px');
        if(isCategorySearchResult)
        {
            this.element.retrieve('filterContainer').setStyle('display','none');
        }
        else
        {
            resultSearchBar.setStyle('display','none');
        }

    },
    addNavigationElements:function()
    {
        var wrapper = new Element('div', {'class':'wrapper'}).inject(this.element);
        var navigationContainer = new Element('span', {'class':'topFilter_navigation_container'}).inject(wrapper);

        var volver = new Element('span', {'class':'topFilter_navigation_option topFilter_navigation_linkModeButton', 'html':MessageLabels.back}).inject(navigationContainer);
        var barravolver=new Element('span', {'class':'topFilter_navigation_separator', 'html':'|'}).inject(navigationContainer);

        //Añadimos los div de los 3 elementos y los separadores
        var ant = new Element('span', {'class':'topFilter_navigation_option', text:'<'}).inject(navigationContainer);
        var numproducts = new Element('span', {'class':'topFilter_navigation_option topFilter_antsigbutton', text:obContainer.items.length+' '+MessageLabels.products}).inject(navigationContainer);
        numproducts.setStyle('cursor','default');
        this.element.store('numproducts',numproducts);
        var sig = new Element('span', {'class':'topFilter_navigation_option ', text:'>'}).inject(navigationContainer);

        navigationContainer.store('ant',ant);
        navigationContainer.store('sig',sig);
        navigationContainer.store('volver',volver);
        navigationContainer.store('barravolver',barravolver);
        this.element.store('navigatonContainer',navigationContainer);

        ant.addEvent('click',function()
        {
            if(!this.productMode)obContainer.selectItemFromBarFilter(false);
            else
            {
                this.loadNextPreviousProduct('previous');
            }
        }.bind(this));

        sig.addEvent('click',function()
        {
            if(!this.productMode)obContainer.selectItemFromBarFilter(true);
            else
            {
                this.loadNextPreviousProduct('next');
            }
        }.bind(this));

        volver.addEvent('click',function()
        {
            this.checkProductMode();
            if(this.mode!="carrusel")
            {
                //obContainer.refreshFromFilter();
                obContainer.proccess=true;
                obContainer.picloaded=-1;
                obContainer.loadItemPic();
                obContainer.resize();
            }
            else
            {
                obContainer.selectItem(obContainer.selectedIndex);
                obContainer.infoElement.fade(1);
            }
        }.bind(this));


        var markElement=$(this.mode+'Mark'); markElement.setStyle('background-color','white');
        markElement.setStyle('border-left','1px solid #B7B7B7');
        markElement.setStyle('border-right','1px solid #B7B7B7');
        markElement.setStyle('border-bottom','1px solid white');
        markElement.setStyle('padding-left','8px ');
        markElement.setStyle('padding-right','8px');
        if(markElement.getPrevious('.topFilter_menu_separator')!=null) markElement.getPrevious('.topFilter_menu_separator').setStyle('visibility','hidden');
        if(markElement.getNext('.topFilter_menu_separator')!=null) markElement.getNext('.topFilter_menu_separator').setStyle('visibility','hidden');
    },
    addViewmodeElements:function()
    {

        var viewmodeContainer = new Element('div', {'class':'topFilter_viewmode_container'}).inject(this.element);

        var vista=new Element('div', {'class':'topFilter_menu_option'}).inject(viewmodeContainer);
        var textovista = new Element('span', {'class':'topFilter_menu_option_header','html':'<b>'+MessageLabels.viewMode+'</b>'}).inject(vista);
        var barra1=new Element('span', {'class':'topFilter_menu_separator', 'text':'|'}).inject(viewmodeContainer);


        //Añadimos los div de los 3 elementos y los separadores
        var gridmodel = new Element('div', {'id':'gridmodelMark','class':'topFilter_viewmode_option'}).inject(viewmodeContainer);
        var barra1=new Element('span', {'class':'topFilter_menu_separator', 'text':'|'}).inject(viewmodeContainer);
        var gridproduct = new Element('div', {'id':'gridproductMark','class':'topFilter_viewmode_option'}).inject(viewmodeContainer);
        var barra1=new Element('span', {'class':'topFilter_menu_separator', 'text':'|'}).inject(viewmodeContainer);
        var carrusel = new Element('div', {'id':'carruselMark','class':'topFilter_viewmode_option'}).inject(viewmodeContainer);

        //Añadimos el icono de cada elemento
        var icongridmodel = new Element('img', {'class':'topFilter_viewmode_icon', 'src':jspStoreImgDir+'img/filterbar/ico_model.gif'}).inject(gridmodel);
        var icongridproduct = new Element('img', {'class':'topFilter_viewmode_icon', 'src':jspStoreImgDir+'img/filterbar/ico_grid.gif'}).inject(gridproduct);
        var iconcarrusel = new Element('img', {'class':'topFilter_viewmode_icon', 'src':jspStoreImgDir+'img/filterbar/ico_carrusel.gif'}).inject(carrusel);


        //Añadimos el texto de cada elemento
        var textgrid = new Element('span', {'class':'topFilter_viewmode_optiontext', 'text':MessageLabels.gridmodel}).inject(gridmodel);
        var textcarrusel = new Element('span', {'class':'topFilter_viewmode_optiontext', 'text':MessageLabels.carrousel}).inject(carrusel);
        var textproduct = new Element('span', {'class':'topFilter_viewmode_optiontext', 'text':MessageLabels.gridproduct}).inject(gridproduct);



        var self=this;
        carrusel.addEvent('click',function(event)
            {
                //this.destroyAll();
                //fnInitializeCarrusel();
                //event.stop();
                self.destroyAlmostAll();
                self.checkProductMode();
                fnchangeToCarrusel();


            });

        gridmodel.addEvent('click',function()
            {
                this.destroyAlmostAll();
                this.checkProductMode();
                fnChangeToCategories(true);

                //fnInitializeCategories(true);

            }.bind(this));
        gridproduct.addEvent('click',function()
            {
                this.destroyAlmostAll();
                this.checkProductMode();
                fnChangeToCategories(false);

                //fnInitializeCategories(true);

            }.bind(this));

        var search = new Element('div', {'class':'topFilter_viewmode_option topFilter_viewmode_search_container'}).inject(viewmodeContainer);
        var iconsearch = new Element('img', {'class':'topFilter_viewmode_icon', 'src':jspStoreImgDir+'img/filterbar/ico_search.gif'}).inject(search);
        var textsearch= new Element('span', {'class':'topFilter_viewmode_optiontext', 'text':MessageLabels.search}).inject(search);

        var searchBox=new Element('div', {'id':'topFilterSearch'}).inject($('layout_back'));
        var searchBack=new Element('div', {'class':'topFilter_search_back'}).inject(searchBox);
        var inputText = new Element('input', {'type':'text' ,'name':'filtersearch','class':'topFilter_search_inputBox'}).inject(searchBack);
        var search2 = new Element('div', {'class':'topFilter_viewmode_option2'}).inject(searchBox);
        var iconsearch2 = new Element('img', {'class':'topFilter_viewmode_icon2', 'src':jspStoreImgDir+'img/filterbar/ico_search.gif'}).inject(search2);
        var textsearch2= new Element('span', {'class':'topFilter_viewmode_optiontext', 'text':MessageLabels.search}).inject(search2);
        searchBox.store('inputtext',inputText);
        search2.addEvent('click',function(){document.location.href=obProductsGrid.searchProductsUrlTemplate.replace("_searchTerm_",inputText.value);});
        inputText.addEvent( 'keydown', function( evt ){
            if( evt.key == 'enter')
            {
                evt.stop();
                document.location.href=obProductsGrid.searchProductsUrlTemplate.replace("_searchTerm_",inputText.value);
            }
        });


        searchBack.setStyle('width',(200)+"px");
        inputText.setStyle('width',(188)+"px");

        //Añadimos los eventos
        searchBox.setStyle('display','none');
        search.addEvent('click',function(){
            $('topFilterSearch').setStyle('display','');
            $('topFilterSearch').retrieve('inputtext').focus();
            viewmodeContainer.fade('hide');
        });
        searchBox.addEvent('mouseleave',function(){
            viewmodeContainer.fade('show');
            $('topFilterSearch').setStyle('display','none');
        });
    },
    prueba:function()
    {
        this.destroyAlmostAll();
        this.checkProductMode();
        fnchangeToCarrusel();
    },
    setMode:function(_mode,_modelMode)
    {
        this.mode=_mode;
        this.modelMode = _modelMode;
    },
    /**Establece la marca en la vista acutal
     **/
    setMark:function()
    {
        var markElement=$(this.mode+'Mark');
        markElement.setStyle('background-color','white');
        markElement.setStyle('border-left','1px solid #B7B7B7');
        if(this.mode!="carrusel")markElement.setStyle('border-right','1px solid #B7B7B7');
        markElement.setStyle('border-bottom','1px solid white');
        markElement.setStyle('padding-left','8px ');
        markElement.setStyle('padding-right','8px');
        if(markElement.getPrevious('.topFilter_menu_separator')!=null) markElement.getPrevious('.topFilter_menu_separator').setStyle('visibility','hidden');
        if(markElement.getNext('.topFilter_menu_separator')!=null) markElement.getNext('.topFilter_menu_separator').setStyle('visibility','hidden');
    },
    /**Borra la marca de la vista actual
     **/
    resetMark:function(_mode)
    {
        var markElement=$(_mode+'Mark'); markElement.setStyle('background-color','');
        markElement.setStyle('border-left','');
        markElement.setStyle('border-right','');
        markElement.setStyle('border-bottom','');
        markElement.setStyle('padding-left','9px ');
        markElement.setStyle('padding-right','9px');
        if(markElement.getPrevious('.topFilter_menu_separator')!=null) markElement.getPrevious('.topFilter_menu_separator').setStyle('visibility','visible');
        if(markElement.getNext('.topFilter_menu_separator')!=null) markElement.getNext('.topFilter_menu_separator').setStyle('visibility','visible');
    },
    /**Se maqueta la parte central enseñando solo el numero de productos visibles en el grid o 1 / xx en el carrusel
    */
    setNavigationBarMode:function()
    {
        //document.removeEvents( 'keydown');

        var anchonavigation = 0;
        if((this.mode=="gridmodel"||this.mode=="gridproduct")&&!this.productMode){
            //MODO PARRILLA
            this.element.retrieve('navigatonContainer').retrieve('ant').setStyle('display','none');
            this.element.retrieve('navigatonContainer').retrieve('sig').setStyle('display','none');
            this.element.retrieve('navigatonContainer').retrieve('volver').setStyle('display','none');
            this.element.retrieve('navigatonContainer').retrieve('barravolver').setStyle('display','none');
            this.element.retrieve('numproducts').setProperty('text',obContainer.currentItems.length +' '+MessageLabels.products);

        }
        else{
            this.element.retrieve('navigatonContainer').retrieve('ant').setStyle('display','');
            this.element.retrieve('navigatonContainer').retrieve('sig').setStyle('display','');
            if(this.productMode)
            {
                //MODO PRODUCTO
                if(obContainer.flashComp!=null) obContainer.flashComp.blur();

                this.element.retrieve('navigatonContainer').retrieve('volver').setStyle('display','');
                this.element.retrieve('navigatonContainer').retrieve('barravolver').setStyle('display','');
            }
            else{
                //MODO CARRUSEL
                this.element.retrieve('navigatonContainer').retrieve('volver').setStyle('display','none');
                this.element.retrieve('navigatonContainer').retrieve('barravolver').setStyle('display','none');
                if(obContainer.flashComp!=null) obContainer.flashComp.focus();
            }
        }
        this.element.retrieve('navigatonContainer').setStyle('display','none');

    },
    addKeyEventListeners:function()
    {
        //Eventos teclado para ir al siguiente y anterior producto con las flechas
        document.addEvent( 'keydown',this.eventsForKeys.bind(this));

        //Eventos para el teclado sobre el iframe. Hay que asignarlos una vez que se carga el iframe.

        $('iframe_product').addEvent('load',this.onIframeLoaded.bind(this));
    },
    onIframeLoaded:function(evt)
    {
        var iframe = $('iframe_product');
        var iframeDoc, UNDEF = "undefined";
        if(iframe.getProperty('src') != null)
        {
            if (typeof iframe.contentDocument != UNDEF)
            {
                iframeDoc = iframe.contentDocument;
            }
            else if (typeof iframe.contentWindow != UNDEF)
            {
                iframeDoc = iframe.contentWindow.document;
            }
            else
            {
                //throw new Error("Unable to access iframe document");
            }
            if(iframeDoc!='undefined')
            {
                if (typeof iframeDoc.addEventListener != UNDEF)
                {
                    iframeDoc.addEventListener('keydown', this.eventsForKeys.bind(this),false);
                }
                else if (typeof iframeDoc.attachEvent != UNDEF)
                {
                    iframeDoc.attachEvent('onkeydown', function(e) {this.eventsForKeys(e);}.bind(this));
                }
            }
        }
    },
    eventsForKeys:function(evt)
    {
        if(this.productMode)
        {
            var key=null;
            var stopEvent=true;
            //Si viene de la pagina de categories
            if(evt.key!=undefined)  key = evt.key;
            //Si viene del iframe
            else
            {
                stopEvent=false;
                if(evt.keyCode==37) key ="left";
                else if(evt.keyCode==39) key ="right";
                else if(evt.keyCode==27) key ="esc";
            }

            if( key == 'right')
            {

                this.loadNextPreviousProduct('next');
                if(stopEvent)evt.stop();
            }
            else if(key == 'left')
            {

                this.loadNextPreviousProduct('previous');
                if(stopEvent)evt.stop();
            }
            else if(key=="esc")
            {
                if(stopEvent)evt.stop();
                this.checkProductMode();
                if(this.mode!="carrusel")
                {
                    obContainer.proccess=true;
                    obContainer.picloaded=-1;
                    obContainer.loadItemPic();
                    obContainer.resize();
                }
                else
                {
                    obContainer.selectItem(obContainer.selectedIndex);
                    obContainer.infoElement.fade(1);
                }
            }
        }
    },
    loadNextPreviousProduct:function(_switch)
    {
        var nextItemIndex=0;
        if(_switch=="next")
        {
            nextItemIndex=(obContainer.selectedIndex<obContainer.currentItems.length-1)? obContainer.selectedIndex+1:0;
        }
        else if(_switch=="previous")
        {
            nextItemIndex=(obContainer.selectedIndex>0)?  obContainer.selectedIndex-1:obContainer.currentItems.length-1;
        }

        //($('iframe_product')).setProperty('src',obContainer.currentItems[nextItemIndex].data.link);
        //($('iframe_product')).setProperty('src','http://192.168.0.77/pullstore/web/Navigation/Main/ItxProductView.jsp');
        obContainer.selectedIndex = nextItemIndex;
        this.setNavigationBarProducts();
        //Actualizamos el hash de producto
        hashListener.updateHash("/"+obContainer.currentItems[obContainer.selectedIndex].data.id+"/"+obContainer.currentItems[obContainer.selectedIndex].data.name);
    },
    /**Actualiza el numero de productos en l aparte central
     *Se llama desde updateCurrentFilters en esta clase o desde el carrusel al hacer select de un producto
     **/
    setNavigationBarProducts:function()
    {
        this.element.retrieve('navigatonContainer').setStyle('display','');
        if((this.mode=="gridmodel"||this.mode=="gridproduct")&&!this.productMode){
            this.element.retrieve('numproducts').setProperty('text',obContainer.currentItems.length +' '+MessageLabels.products);
            anchonavigation = this.element.retrieve('numproducts').getStyle('width').toInt() +(this.element.retrieve('numproducts').getStyle('padding-left').toInt()*2);

        }
        else{
            this.element.retrieve('numproducts').setProperty('text', (obContainer.selectedIndex.toInt()+1) + ' / '+obContainer.currentItems.length);
            anchonavigation = this.element.retrieve('numproducts').getStyle('width').toInt() +(this.element.retrieve('navigatonContainer').retrieve('sig').getStyle('padding-left').toInt()*6)+ this.element.retrieve('navigatonContainer').retrieve('ant').getStyle('width').toInt()+ this.element.retrieve('navigatonContainer').retrieve('sig').getStyle('width').toInt()+this.element.retrieve('navigatonContainer').retrieve('volver').getStyle('width').toInt();
        }
        anchonavigation = this.element.retrieve('navigatonContainer').getStyle('width');
    },
    feedFilter:function(_price)
    {
        this.addToFilters(_price.toString(),this.prices);
    },
    sortPrices:function(){

        this.prices.sort(function(a,b){return a - b})
    },
    setFamilies:function(_item)
    {
        //Recogido del JSON de menu
        this.families.push(_item);
    },
    setFilter:function(_filters,_array,_arraynames)
    {
        //Del apartado filtros del JSON nutrimos de los valores el array de filtros y de nombres el array de nombres de filtros.(Menos los precios)
        _filters.each(function(item,index)
        {
            _array.push(item.id);
            _arraynames.push(item.name);
        });
    },
    addToFilters: function(_filter,_array)
    {
        //Vamos incluyendo nuevos items al array de filtros. Esto se hace solo con los filtros de precios.
        if (typeof _filter == 'string'){
            _array.include(_filter);
        }
        else{
            _array.combine(_filter);
        }
    },
    removeFilterWhichHasNoProducts:function()
    {
        var filterIsUsed = false;
        //comprobamos filtros de features. Si algun filtro no est? presente en ningun producto lo eliminamos de la lista de features y de featuresnames
        for (var j=0; j < this.features.length; j++)
        {
            filterIsUsed = false;
            for (var i=0; i < obContainer.items.length; i++)
            {
                if(obContainer.items[i].data.features == this.features[j]) filterIsUsed = true;
            }
            if(!filterIsUsed)
            {
                //this.features.erase(this.features[j]);
                //this.featuresnames.erase(this.featuresnames[j]);
                this.features[j]=null;
                this.featuresnames[j]=null;
            }
        }
        //comprobamos filtros de colors. Si algun filtro no est? presente en la lista de colores de ningun  producto lo eliminamos de la lista de colors y de colorsnames
        for (var j=0; j < this.colors.length; j++)
        {
            filterIsUsed = false;
            for (var i=0; i < obContainer.items.length; i++)
            {
                for (var k=0; k < obContainer.items[i].data.colors.length; k++)
                {
                    if(obContainer.items[i].data.colors[k] == this.colors[j]) filterIsUsed = true;
                }

            }
            if(!filterIsUsed)
            {
                this.colors[j]=null;
                this.colorsnames[j]=null;
            }
        }
        //comprobamos filtros de sizes. Si algun filtro no est? presente en la lista de sizes de ningun  producto lo eliminamos de la lista de sizes y de sizesnames
        for (var j=0; j < this.sizes.length; j++)
        {
            filterIsUsed = false;
            for (var i=0; i < obContainer.items.length; i++)
            {
                for (var k=0; k < obContainer.items[i].data.sizes.length; k++)
                {
                    if(obContainer.items[i].data.sizes[k] == this.sizes[j]) filterIsUsed = true;
                }
            }
            if(!filterIsUsed)
            {
                this.sizes[j]=null;
                this.sizesnames[j]=null;
            }
        }
        this.features=this.features.clean();
        this.featuresnames=this.featuresnames.clean();
        this.colors=this.colors.clean();
        this.colorsnames=this.colorsnames.clean();
        this.sizes=this.sizes.clean();
        this.sizesnames=this.sizesnames.clean();

    },
    updateCurrentFilters: function(_filter,_array,_imgcheck,familia,index)
    {

        //Comprobamos si estamos en producto y lo ocultamos.
        this.checkProductMode();

        //Comprobamos si el boton está enabled, resultado de la funcion checkFutureFilters que activa o desativa botones si producen 0 items.
        var enabled = this.element.retrieve('filterblock'+familia).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+index).retrieve('enabled');
        //Si lo está ejecutamos.
        if(enabled){
            //Si tratamos filtro de Tipo,Colo o talla, funciona como checkbox
            if(familia!=3){
                //Actualizamos el array de filtros actuales. Si no existe, se incluye, si existe, se elimina.
                if (!_array.contains(_filter)){
                    _array.push(_filter);
                    _imgcheck.setProperty('src' , jspStoreImgDir+'img/filterbar/check_on.gif');
                    _imgcheck.store('selected',true);
                }
                else{
                    _array.erase(_filter);
                    _imgcheck.setProperty('src' , jspStoreImgDir+'img/filterbar/check_off.gif');
                    _imgcheck.store('selected',false);
                }
            }
            //Si tratamos filtro de Precio funciona como radiobutton
            else{
                var contains=!_array.contains(_filter);
                //Vaciamos el array de precios
                this.currentfilters[familia].empty();
                //Eliminamos los checks
                ($('layout_back').getElements('.imgfiltergroup'+familia)).setProperty('src' , jspStoreImgDir+'img/filterbar/check_off.gif');
                ($('layout_back').getElements('.imgfiltergroup'+familia)).store('selected',false);

                if (contains){
                    //Ponemos el check del filtro
                    _imgcheck.setProperty('src' , jspStoreImgDir+'img/filterbar/check_on.gif');
                    _imgcheck.store('selected',true);
                    //Añadimos el filttro
                    this.currentfilters[familia].push(_filter);
                }
            }

            //Si estan marcados todos los cheks de una clase los desmarcamos todos.
            //if(_array.length == this.filters[familia].length) this.clearTypeFilters(familia);

            if(_array.length>0)
            {
                //this.element.retrieve('filterblock'+familia).retrieve('title').setStyle('font-weight','bold');
            }
            else{
                //this.element.retrieve('filterblock'+familia).retrieve('title').setStyle('font-weight','normal');
            }


            //Eliminamos los elementos de pantalla, actualizamos con los filtros actuales, e incluimos elementos.
            obContainer.refreshFromFilter();

            this.checkFutureItems(familia);
            this.checkClearFilters();


            //this.element.retrieve('numproducts').setProperty('text',obContainer.currentItems.length +' '+MessageLabels.products);

        }
    },
    /**FUNCIONES PARA LOS BOTONES DE LIMPIAR FILTROS*/
    /**Esta funcion comprueba si tiuenen que estar habilitados o no los botones limpiar de cada familia y el de limpiar todos*/
    checkClearFilters:function()
    {
        //Actualiza el numero de productos en la barra
        this.setNavigationBarProducts();

        var clearAll=false;
        for (var j=0; j < this.currentfilters.length; j++) {
            //Si no está marcado ninguno desactivamos el limpiar
            if(this.currentfilters[j].length == 0)
            {
                this.enableButtonClean(this.element.retrieve('filterblock'+j).retrieve('clearAll'),false,j);
            }
            //Si esta marcado alguno activamos limpiar
            else
            {
                this.enableButtonClean(this.element.retrieve('filterblock'+j).retrieve('clearAll'),true,j);
                clearAll=true;
            }
        }
        if(clearAll) this.enableButtonCleanAll(true);
        else this.enableButtonCleanAll(false);
    },
    /*Habilita o deshabilita el boton limpiar*/
    enableButtonClean:function(element,b,family){
        if(b){
            element.setStyle('display','')
            element.setStyle('color','#6b6b6b');
            element.addEvent('mouseenter',function(){this.setStyle('background-color','#cccccc');});
            element.addEvent('mouseleave',function(){this.setStyle('background-color','');});
            this.setClearFilters(family,element);

        }
        else{
            element.setStyle('display','none')
            element.removeEvents('click');
            element.removeEvents('mouseenter');
            element.removeEvents('mouseleave');
            element.setStyle('color','#9c9c9c');
            element.setStyle('background-color','');
        }
    },
    /*Enseña u oculta el el boton limpiar todo*/
    enableButtonCleanAll:function(b){
        if(b){
            this.element.retrieve('clearAllElementWrap').setStyle('display','');
            this.element.retrieve('filterContainer').retrieve("last_separator").setStyle('display','');

        }
        else{
            this.element.retrieve('clearAllElementWrap').setStyle('display','none');
            this.element.retrieve('filterContainer').retrieve("last_separator").setStyle('display','none');
        }
    },
    /*Limpia todos los filtros*/
    setClearAllFilters:function(){
        //Comprobamos si estamos en producto y lo ocultamos.
        this.checkProductMode();

        for (var j=0; j < this.currentfilters.length; j++) {
            //Actualizamos el array de filtros actuales. Si no existe, se incluye, si existe, se elimina.
            this.currentfilters[j].empty();
            //Eliminamos los checks
            ($('layout_back').getElements('.imgfiltergroup'+j)).setProperty('src' , jspStoreImgDir+'img/filterbar/check_off.gif');
            ($('layout_back').getElements('.imgfiltergroup'+j)).store('selected',false);
            //Quitamos las negritas
            this.element.retrieve('filterblock'+j).retrieve('title').setStyle('font-weight','normal');
        }
        //Eliminamos los elementos de pantalla, actualizamos con los filtros actuales, e incluimos elementos.
        obContainer.refreshFromFilter();
        this.checkFutureItems();
        this.checkClearFilters();
    },
    /*Añade la funcion de click para cada elemento limpiar de cada familia*/
    setClearFilters:function(i,element)
    {
        var self=this;
        element.addEvent('click',function()
        {
            self.clearTypeFilters(i)
        }.bind(this));
    },
    /*Define que hace un boton limpiar pasandole la familia del filtro*/
    clearTypeFilters: function(i)
    {
        //Comprobamos si estamos en producto y lo ocultamos.
        this.checkProductMode();

        //Actualizamos el array de filtros actuales. Si no existe, se incluye, si existe, se elimina.
        this.currentfilters[i].empty();
        //Eliminamos los checks
        ($('layout_back').getElements('.imgfiltergroup'+i)).setProperty('src' , jspStoreImgDir+'img/filterbar/check_off.gif');
        ($('layout_back').getElements('.imgfiltergroup'+i)).store('selected',false);
        //Quitamos la negrita
        this.element.retrieve('filterblock'+i).retrieve('title').setStyle('font-weight','normal');
        //Eliminamos los elementos de pantalla, actualizamos con los filtros actuales, e incluimos elementos.
        obContainer.refreshFromFilter();

        this.checkFutureItems();

        this.checkClearFilters();
    },
    /**FUNCIONES PARA LOS FILTROS FUTUROS*/
    /*Comprueba que pasa cuando se habilita un filtro, para cada uno de ellos*/
    checkFutureItems:function(familia){

        for (var j=0; j < this.filters.length; j++) {
            for (var i=0; i < this.filters[j].length; i++) {
                var selected = this.getSelected(j,i);

                //Replicamos los filtros actuales en filtros futuros.
                this.cloneCurrentFilters();
                //Añade el filtro a la lista de filtros futuros.
                this.updateFutureFilters(this.filters[j][i],this.futurefilters[j]);
                //Comprrueba el numero de items una vez aplicado el filtro chequeando si las propiedades del item están en la lista de filtros futuros
                var itemsnum = obContainer.filterFutureItems();
                //Comprueba que el filtro actual está en el item
                var itemswiththisfilter = obContainer.checkActualFilterFutureItems(j, this.filters[j][i]);

                //Si provoca 0 o el numero actual items se deshabilita
                if(itemsnum==0 || (itemsnum == obContainer.currentItems.length && itemswiththisfilter==0)){
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).retrieve('img').setProperty('src',jspStoreImgDir+'img/filterbar/check_disabled.gif');
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).retrieve('text').setStyle('color','#9c9c9c');
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).store('enabled',false);
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).setStyle('cursor','default');
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).removeEvents('mouseleave');
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).removeEvents('mouseenter');
                }
                //Si no, se activa y se le devuelven los eventos over out
                else{
                    if(selected) this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).retrieve('img').setProperty('src',jspStoreImgDir+'img/filterbar/check_on.gif');
                    else this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).retrieve('img').setProperty('src',jspStoreImgDir+'img/filterbar/check_off.gif');
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).retrieve('text').setStyle('color','#6b6b6b');
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).store('enabled',true);
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).setStyle('cursor','pointer');
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).setStyle('_cursor','hand');
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).addEvent('mouseenter',function(){this.setStyle('background-color','#cccccc');});
                    this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).addEvent('mouseleave',function(){this.setStyle('background-color','');});
                }
                //Aqui actualizamos los items   que produciria cada filtro al pincharlo (descartado de momento)
                //if(!selected || (selected && familia!=j && itemswiththisfilter!=0)) this.setItemsNumberOnFilter(j,i,itemswiththisfilter);

            }
        }
    },
    /*Actualiza el array de filtros futuros*/
    updateFutureFilters: function(_filter,_array)
    {
        //Actualizamos el array de filtros futuros. Si no existe, se incluye, si existe, se elimina.
        if (!_array.contains(_filter)){
            _array.push(_filter);
        }
        else{
            _array.erase(_filter);
        }

    },
    /*Clona los filtros futuros dejandolo igual que el de activos(currentfileters)*/
    cloneCurrentFilters:function()
    {   //pone el array de filtros futuros igual que el de activos
        for (var k=0; k < this.futurefilters.length;k++) {
            this.futurefilters[k].empty();
            this.futurefilters[k].clean();
        }
        for (var k=0; k < this.currentfilters.length;k++) {
            for (var j=0; j < this.currentfilters[k].length;j++) {
                this.futurefilters[k].push(this.currentfilters[k][j]);
            }
        }
    },
    /*Actualiza el numero de elementos que provocaría un filtro al ser pulsado*/
    setItemsNumberOnFilter:function(j,i,itemswiththisfilter)
    {
        if(j==3)
        {
            this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).retrieve('text').setProperty('html',currency.format(this.filtersnames[j][i].toString())+ "   ("+itemswiththisfilter +")" );
        }
        else
        {
            this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).retrieve('text').setProperty('text',this.filtersnames[j][i] + "   (" + itemswiththisfilter+ ")" );
        }
    },
    getSelected:function(j,i)
    {
        return this.element.retrieve('filterblock'+j).retrieve('submenu').retrieve('submenuWarp').retrieve('filter'+i).retrieve('img').retrieve('selected');
    },
    //Se llama cuando se cambia de modo de vista. Cuando se cambia dentro de grid, de modelo a producto, o cuando se cambia a carrusel.
    destroyAll:function(){
        /*if(this.mode=="grid"){
            obContainer.outer.destroy();
        }
        else{
            $('carrousel').setStyle('display','none');
            for(var i=0;i<obContainer.items.length;i++){
                obContainer.items[i].element.destroy();
            }
        }*/
        obContainer.destroyAll();
        this.element.destroy();

        //delete this;
    },
    //Se llama cuando se cambia de modo de vista. Cuando se cambia dentro de grid, de modelo a producto, o cuando se cambia a carrusel.
    destroyAlmostAll:function(){
        obContainer.destroyAlmostAll();
    },
    firstToUpperCase:function(cadena)
    {
        var arraytext = cadena.toLowerCase().split("");
        arraytext[0] =arraytext[0].toUpperCase();
        var text=arraytext.join("");
        return text;
    },
    getFilterName:function(i)
    {
        var temp = "";
        switch(i)
        {
            case 0:
                temp=MessageLabels.features;
            break;
            case 1:
                temp=MessageLabels.colors;
            break;
            case 2:
                temp=MessageLabels.sizes;
            break;
            case 3:
                temp=MessageLabels.prices;
            break;
        }
        return temp;
    },
    alertFilters:function(){
        var precios="";
        var tipos="";
        var colores="";
        var tallas="";

        for(var i=0; i<this.currentprices.length; i++){
            precios = precios + this.currentprices[i] +"::";
        }

        for(var i=0; i<this.currentfeatures.length; i++){
            tipos = tipos + this.currentfeatures[i] +"::";
        }

        for(var i=0; i<this.currentcolors.length; i++){
            colores = colores + this.currentcolors[i] +"::";
        }

        for(var i=0; i<this.currentsizes.length; i++){
            tallas = tallas + this.currentsizes[i] +"::";
        }
        alert("tipos:"+tipos);
    },
    alertFutureFilters:function(){
        var precios="Precio::::";
        var tipos="Tipo::::";
        var colores="Color::::";
        var tallas="Talla::::";

        for(var i=0; i<this.futureprices.length; i++){
            precios = precios + this.futureprices[i] +"::";
        }

        for(var i=0; i<this.futurefeatures.length; i++){
            tipos = tipos + this.futurefeatures[i] +"::";
        }

        for(var i=0; i<this.futurecolors.length; i++){
            colores = colores + this.futurecolors[i] +"::";
        }

        for(var i=0; i<this.futuresizes.length; i++){
            tallas = tallas + this.futuresizes[i] +"::";
        }
        var salida= tipos+"\n"+ colores+"\n"+ tallas+"\n"+ precios+"\n";
        alert("salida:"+salida);
    },
    setProductMode:function(_mode)
    {
        this.productMode=_mode;
    },
    checkProductMode:function()
    {
        if(this.productMode){
            obContainer.showAllProducts();
            //Borramos el hash de producto
            //window.location.hash ="";
            //hashListener.updateHash('');
        }
    },
    resize:function()
    {
        this.showFilterScroll();
    },
    showFilterScroll:function()
    {
        var i;
        for(i=0; i<this.filters.length; i++)
        {
            this.checkFilterScrollByElement(i);
        }
    },
    checkFilterScrollByElement:function(_element)
    {
        if($('layout_top').getSize().y + $('topFilterMenuBar').getSize().y + this.heightFiltersSubMenus[_element] + 50 > window.getSize().y)
        {
            this.element.retrieve('filterblock'+_element).retrieve('submenu').retrieve('submenuWarp').setStyle('max-height',(window.getSize().y-150)+'px');
            this.element.retrieve('filterblock'+_element).retrieve('submenu').retrieve('submenuWarp').setStyle('height',(window.getSize().y-150)+'px');
            this.element.retrieve('filterblock'+_element).retrieve('submenu').retrieve('submenuWarp').setStyle('overflow','hidden');
        }else{
            this.element.retrieve('filterblock'+_element).retrieve('submenu').retrieve('submenuWarp').setStyle('max-height','');
            this.element.retrieve('filterblock'+_element).retrieve('submenu').retrieve('submenuWarp').setStyle('height','');
            this.element.retrieve('filterblock'+_element).retrieve('submenu').retrieve('submenuWarp').setStyle('overflow','');
        }
        this.scrollBarFilters[_element].resize();
    }
});
/************FUNCIONES DE INICIO EN PARRILLA Y CAMBIO A PARRILLA ***********************/
(function(){
	var fnInitializeCategories = function(modelMode)
	{
		//Esta variable sirve para saber si es la primera vez que se carga la seccion. Si esta a true, al cargar el swf del carrusel flash, se inicializan los filtros
		isCategoryInitializing=false;

		//Ordena los filtros de tallas
		obProductsGrid.filters.size.sort(fnSizeSortCategories);

		//Escogemos el modo, producto o modelo dentro del tipo parrilla
		var viewMode = "";
		if(modelMode)
		{
			viewMode="gridmodel";
			_gaq.push(['_trackPageview','&mxr=/'+StoreLocatorJSON.country+'/opciones-visualizacion/carga/modelo']);
		}
		else
		{
			viewMode="gridproduct";
			_gaq.push(['_trackPageview','&mxr=/'+StoreLocatorJSON.country+'/opciones-visualizacion/carga/producto']);
		}

		//Escribimos la cookie de sesi?n para guardar el modo de vista
		Cookie.write('WC_CategoriesViewMode', viewMode, {duration: false});

		$('carrousel').setStyle('display','none');
		$('carrouselInfo').setStyle('display','none');
		($('layout_back')).adopt(new Element('div', {'id':'grid_outerContainer'}));
		($('grid_outerContainer')).adopt(new Element('div', {'id':'grid_innerContainer'}));
		($('layout_back')).adopt(new Element('div', {'id':'topFilterMenuBar'}));

		//Creamos el iframe
		($('layout_back')).adopt(new Element('iframe', {'id':'iframe_product','frameborder':'0','scrolling':'no','src':'#' }));
		($('iframe_product')).setStyle('display','none');

		//Creamos la bara de filtro e items de datos
		var urlPrefix = obProductsGrid.urlPrefix;
		obItemsData = new ItemsData("grid");
		obFilter = new Filter($('topFilterMenuBar'), viewMode, modelMode);
		obProductsGrid.items.each(function(item,index){obItemsData.addItem(item, urlPrefix,obFilter);});

		//Creamos la parrilla
		obContainer = new Grid($('grid_innerContainer'),$('grid_outerContainer'),obFilter,obItemsData,modelMode);
		obContainer.addItems();
		obContainer.addLast();
		obContainer.addScroll();

		//Inicializamos filtros
		fnInitializeFilter();

		//Comprobamos el hash para cargar el producto si viene en la url
		fnLoadProductIntoCategories();

		//A?adimos resize
		resizeController.addFunction(fnResizeProductsGrid);
	};
	//we won't have access outside to fnchangeToCarrusel, so add a global ref
	window.fnInitializeCategories = fnInitializeCategories;
})();

(function(){
	var fnChangeToCategories = function(modelMode)
	{
		var viewMode = "";
		if(modelMode)
		{
			viewMode="gridmodel";
			_gaq.push(['_trackPageview','&mxr=/'+StoreLocatorJSON.country+'/opciones-visualizacion/click/modelo']);
		}
		else
		{
			viewMode="gridproduct";
			_gaq.push(['_trackPageview','&mxr=/'+StoreLocatorJSON.country+'/opciones-visualizacion/click/producto']);
		}

		Cookie.write('WC_CategoriesViewMode', viewMode, {duration: false});

		$('carrousel').setStyle('display','none');
		$('carrouselInfo').setStyle('display','none');
		obContainer=new Grid($('grid_innerContainer'),$('grid_outerContainer'),obFilter,obItemsData,modelMode);
		($('grid_outerContainer')).setStyle('display','');
		($('grid_outerContainer')).adopt(new Element('div', {'id':'grid_innerContainer'}));
		obContainer.element = $('grid_innerContainer');

		//Creamos contenedor e items
		var urlPrefix = obProductsGrid.urlPrefix;
		obItemsData.setMode("grid");
		if(modelMode)
		{
			obFilter.setMode("gridmodel",modelMode);
			obFilter.resetMark('gridproduct');
		}
		else
		{
			obFilter.setMode("gridproduct",modelMode);
			obFilter.resetMark('gridmodel');
		}
		obFilter.resetMark('carrusel');
		obFilter.setMark();


		obContainer.setMode(modelMode);
		obContainer.addItems();
		obContainer.addLast();
		obContainer.addScroll();

		obFilter.setNavigationBarMode();
		obFilter.setNavigationBarProducts();

	};
	//we won't have access outside to fnchangeToCarrusel, so add a global ref
	window.fnChangeToCategories = fnChangeToCategories;
})();


/************FUNCIONES DE INICIO EN CARRUSEL Y CAMBIO A CARRUSEL ***********************/
(function(){
	var fnInitializeCarrusel = function()
	{
		//Escribimos la cookie de sesi?n para guardar el modo de vista
		Cookie.write('WC_CategoriesViewMode', "carrusel", {duration: false});
		_gaq.push(['_trackPageview','&mxr=/'+StoreLocatorJSON.country+'/opciones-visualizacion/carga/carrusel']);

		//Ordena los filtros de tallas
		obProductsGrid.filters.size.sort(fnSizeSortCategories);

		($('layout_back')).adopt(new Element('div', {'id':'grid_outerContainer'}));
		($('grid_outerContainer')).adopt(new Element('div', {'id':'grid_innerContainer'}));
		($('layout_back')).adopt(new Element('div', {'id':'topFilterMenuBar'}));
		($('grid_outerContainer')).setStyle('display','none');

		$('carrousel').setStyle('display','');
		$('carrouselInfo').setStyle('display','');
		$('carrousel').setStyle('display','none');
		$('carrouselInfo').setStyle('display','none');

		//Creamos iframe
		($('layout_back')).adopt(new Element('iframe', {'id':'iframe_product','frameborder':'0','scrolling':'no','src':'#' }));
		($('iframe_product')).setStyle('display','none');

		//Creamos la bara de filtro e items de datos
		var urlPrefix = obProductsGrid.urlPrefix;
		obItemsData = new ItemsData("carrusel");
		obFilter=new Filter($('topFilterMenuBar'),"carrusel",false);
		obProductsGrid.items.each(function(item,index){obItemsData.addItem(item, urlPrefix,obFilter);});

		//Creamos el carrusel
		obContainer=new Carrousel($('carrousel'),$('carrouselInfo'),obFilter,obItemsData);

		//Si no hay plugin de flash
		var isFlash= Browser.Plugins.Flash && (Browser.Plugins.Flash.version > 8);
		//isFlash=false;
		if(!isFlash) {
			obContainer.addItems();
			fnSetCarruselVisible.delay(300);
			obContainer.refreshFromFilter();
			fnInitializeFilter();
			fnLoadProductIntoCategories();
			obFilter.setNavigationBarProducts();
		}
		//Si hay plugin de flash
		else{
			obContainer.createFlashContainer();
			//el fnInitializeFilter hay que hacerlo desde el carrusel una vez que el swf est? cargado.
			//el fnLoadProductIntoCategories(); lo mismo, porque si no no tenemos los items creados.
			//Solo se hace si isCategoryInitializing es true (quiere decir que entramos en modo carrusel a la seccion)
		}

		resizeController.addFunction(fnResizeProductsGrid);
	};
	//we won't have access outside to fnchangeToCarrusel, so add a global ref
	window.fnInitializeCarrusel = fnInitializeCarrusel;
})();

(function(){
	var fnchangeToCarrusel = function()
	{
		Cookie.write('WC_CategoriesViewMode', "carrusel", {duration: false});
		_gaq.push(['_trackPageview','&mxr=/'+StoreLocatorJSON.country+'/opciones-visualizacion/click/carrusel']);

		($('grid_outerContainer')).setStyle('display','none');
		$('carrousel').setStyle('display','');
		$('carrouselInfo').setStyle('display','');
		$('carrousel').setStyle('display','none');
		$('carrouselInfo').setStyle('display','none');

		//Creamos el contenedor
		obContainer=new Carrousel($('carrousel'),$('carrouselInfo'),obFilter,obItemsData);
		var urlPrefix = obProductsGrid.urlPrefix;
		obItemsData.setMode("carrusel");
		obFilter.setMode("carrusel",false);
		obFilter.resetMark('gridmodel');
		obFilter.resetMark('gridproduct');
		obFilter.setMark();
		obFilter.setNavigationBarMode();

		//Si no hay plugin de flash
		var isFlash= Browser.Plugins.Flash && (Browser.Plugins.Flash.version > 8);
		//isFlash=false;
		if(!isFlash) {
			obContainer.addItems();
			fnSetCarruselVisible.delay(300);
			obContainer.refreshFromFilter();
		}
		//Si hay plugin de flash
		else{
			obContainer.createFlashContainer();
		}
	};
	//we won't have access outside to fnchangeToCarrusel, so add a global ref
	window.fnchangeToCarrusel = fnchangeToCarrusel;
})();

(function(){
	var fnSetCarruselVisible = function()
	{
		//obContainer.resize();
		$('carrousel').setStyle('display','');
		$('carrouselInfo').setStyle('display','');
	};
	//we won't have access outside to fnchangeToCarrusel, so add a global ref
	window.fnSetCarruselVisible = fnSetCarruselVisible;
})();


/************FUNCION PARA INICIALIZAR LOS FILTROS ***********************/
(function(){
	var fnInitializeFilter = function()
	{
		//Recogemos la categor?a en la que estamos (hombre/mujer)
		var catId  = obProductsGrid.categoryId;
		var indexPrincipalId = 0;
		TopMenuJSON.menu.each(function(menu,index1){
			menu.items.each(function(item,index){
				if(catId == item.categoryId)indexPrincipalId=index1;
			});
		});
		//Se registra en menu.js
		if(activeTopMenuElement!==null)
		{
			$('top_menu').addEvent('mouseenter',function()
			{
				if(activeTopMenuElement!==null)
				{
					if(activeTopMenuElement!==null) activeTopMenuElement.removeClass('defaultActive');
				}
			});
			$('top_menu').addEvent('mouseleave',function()
			{
				if(activeTopMenuElement!==null)
				{
					activeTopMenuElement.addClass('defaultActive');
					if(activeTopMenuElement.getPrevious('.top_menu_separator')!==null) activeTopMenuElement.getPrevious('.top_menu_separator').setStyle('color','transparent');
					if(activeTopMenuElement.getNext('.top_menu_separator')!==null) activeTopMenuElement.getNext('.top_menu_separator').setStyle('color','transparent');
				}
			});
			$('top_menu').fireEvent('mouseleave');
		}



		TopMenuJSON.menu[indexPrincipalId].items.each(function(item,index){obFilter.setFamilies(item);});
		obFilter.setFilter(obProductsGrid.filters.feature,obFilter.features,obFilter.featuresnames);
		obFilter.setFilter(obProductsGrid.filters.color,obFilter.colors,obFilter.colorsnames);
		obFilter.setFilter(obProductsGrid.filters.size,obFilter.sizes,obFilter.sizesnames);
		obFilter.sortPrices();
		obFilter.removeFilterWhichHasNoProducts();
		obFilter.addElements();
		obFilter.setNavigationBarMode();
		obFilter.setNavigationBarProducts();
	};
	//we won't have access outside to fnchangeToCarrusel, so add a global ref
	window.fnInitializeFilter = fnInitializeFilter;
})();

function fnSizeSortCategories(_a,_b){
	var sizeArray=["XXS","XS","S","M","L","XL","XXL"];
	if(!isNaN(_a.name)&&!isNaN(_b.name))
	{
		return(Number(_a.name)>Number(_b.name));
	}
	if(!isNaN(_a.name))
	{
		return(false);
	}
	else if(!isNaN(_b.name))
	{
		return(true);
	}
	else return(sizeArray.indexOf(_a.name.toUpperCase())>sizeArray.indexOf(_b.name.toUpperCase()));
}

/************FUNCION PARA CARGAR UN PRODUCTO SI EXISTE HASHTAG ***********************/
function fnLoadProductIntoCategories()
{
	if(window.location.hash)
	{
		//Comprobamos el hash del navegador que debe tener el esquema -> #/53214/PANTALONES BLANCO
		var idproducto = window.location.hash.split("/")[1];
		obContainer.mainShowProductDetail(idproducto);
		//obContainer.mainShowProductDetail("33322");
	}
    else
	{
        // Fragment doesn't exist
	}
}

/********************************FUNCION PARA RESIZE **************************************/
(function(){
    var fnResizeProductsGrid = function()
    {
        obFilter.resize();
        obContainer.resize();
    };
    //we won't have access outside to fnchangeToCarrusel, so add a global ref
    window.fnResizeProductsGrid = fnResizeProductsGrid;
})();

/********************************FUNCION PARA HASH **************************************/


var hashCurrent = '';
var hashListener;
var fnInitializeHashListener = function()
{
	hashListener = new HashListener();

	hashListener.addEvent('hashChanged',function(new_hash){

		if(new_hash != hashCurrent)
		{
			hashCurrent = new_hash;
			if(hashCurrent.length>0)
			{
				var idproducto = new_hash.split('/')[1];
				if($('iframe_product') == null)
				{
					var iframe_producto = new Element('iframe', {'id':'iframe_product','frameborder':'0','scrolling':'no' });
					($('layout_back')).adopt(iframe_producto);
				}
				obContainer.mainShowProductDetail(idproducto);
			}
			else
			{
				obContainer.showAllProducts(true);
				if(obFilter != null)
				{
					if(obFilter.mode != "carrusel")
					{
						obContainer.proccess=true;
						obContainer.picloaded=-1;
						obContainer.loadItemPic();
						obContainer.resize();
					}
					else
					{
						obContainer.selectItem(obContainer.selectedIndex);
						obContainer.infoElement.fade(1);
					}
				}
			}
		}
	});
	hashListener.start();
};

var categoryViewMode=null;
var obFilter=null;
var obItemsData=null;
var isCategoryPage=true;
var isCategoryInitializing=true;

fnInitializeCategoriesPage();

function fnInitializeCategoriesPage()
{
	fnInitializeHashListener();
	if(Cookie.read('WC_CategoriesViewMode')!=null)
	{
		//Si existe la cookie la leemos y cargamos el modo que corresponde
		categoryViewMode = Cookie.read('WC_CategoriesViewMode');
		if(categoryViewMode == "gridmodel") loadController.addFunction(fnInitializeCategories.pass(true));
		else if(categoryViewMode == "gridproduct") loadController.addFunction(fnInitializeCategories.pass(false));
		else if(categoryViewMode == "carrusel") loadController.addFunction(fnInitializeCarrusel);
	}
	else{
		//Si no cargamos el modo por defecto(modelo)
		loadController.addFunction(fnInitializeCategories.pass(true));
	}
}



/*

function fnLoadJSONCategories()
{
	ajaxHelper.requestJson(
	{
		method:'post',
		evalResponse:false,
		evalScripts:false,
		url: obProductsJSONUrl,
		onSuccess:function(responseJSON)
		{
			if(responseJSON!=null)
			{
				obProductsGrid = responseJSON;
				fnInitializeCategoriesPage();
			}
			else
			{
				new ErrorPanel(responseJSON.title, responseJSON.message);
			}
		}
	});
};*/

//fnLoadJSONCategories();





