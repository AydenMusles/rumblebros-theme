// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: bcSfFilterConfig.custom.products_per_page,
        // Optional
        loadProductFirst: true,
        numberFilterTree: 2,
        styleScrollToTop: 'style2',
    }
};

var bcSfFilterTemplate = {
    'saleLabelHtml': '<span class="label sale">' + bcSfFilterConfig.label.sale + '</span>',
    'soldOutLabelHtml': '<span class="label sold-out">' + bcSfFilterConfig.label.sold_out + '</span>',
    'saleTextHtml': '<span class="sale">' + bcSfFilterConfig.label.sale + '</span> ',
    'soldOutTextHtml': '<span class="sold-out">' + bcSfFilterConfig.label.sold_out + '</span> ',
    'quickViewHtml': '<div class="sca-qv-button-wrap"><a class="sca-qv-button" href="#sca-qv-showqv" handle="{{itemHandle}}" style="font-family: tahoma; font-size: 14px; color: rgb(255, 255, 255); background: rgb(0, 0, 0);">QUICK VIEW</a></div>',
    'vendorHtml': '<span class="vendor"><a href="{{itemVendorUrl}}">{{itemVendorLabel}}</a></span>',

    // Grid Template
    'productGridItemHtml': '<div class="box product">' +
                                '<figure>' +
                                    '<div class="image-table">' +
                                        '<div class="image-cell">' +
                                            '<a href="{{itemUrl}}" {{itemImageClass}}>' +
                                                '<img src="{{itemThumbUrl}}" alt="{{itemTitle}}">' +
                                                '{{itemSaleLabel}}' +
                                                '{{itemSoldOutLabel}}' +
                                            '</a>' +
                                        '</div>' +
                                    '</div>' +
                                    '<figcaption>' +
                                        '<div class="product-title">' +
                                            '<a href="{{itemUrl}}" class="product-title">{{itemTitle}}</a>' +
                                            '{{itemVendor}}' +
                                        '</div>' +
                                        '<span class="price">{{itemPrice}}</span>' +
                                    '</figcaption>' +
                                '</figure>' +
                            '</div>',

    // List Template
    'productListItemHtml':  '<div class="box product">' +
                                '<figure>' +
                                    '<div class="product-thumbnail sca-qv-image">' +
                                        '<a href="{{itemUrl}}" {{itemImageClass}}>' +
                                            '<img src="{{itemThumbUrl}}" alt="{{itemTitle}}">' +
                                        '</a>' +
                                    '</div>' +
                                    '<figcaption>' +
                                        '<header>' +
                                            '<div class="product-title">' +
                                                '<a href="{{itemUrl}}" class="product-title">{{itemTitle}}</a>' +
                                                '{{itemVendor}}' +
                                            '</div>' +
                                            '<span class="price">{{itemSaleText}}{{itemSoldOutText}}{{itemPrice}}</span>' +
                                        '</header>' +
                                        '<div class="description rte"><p>{{itemDescription}}</p></div>' +
                                        '{{itemSaleLabel}}' +
                                        '{{itemSoldOutLabel}}' +
                                    '</figcaption>' +
                                '</figure>' +
                            '</div>',

    // Pagination Template
    'previousHtml': '<li><a href="{{itemUrl}}" title="layout.pagination.previous_html">&larr;</a></li>',
    'nextHtml': '<li><a href="{{itemUrl}}" title="layout.pagination.next_html">&rarr;</a></li>',
    'pageItemHtml': '<li><a href="{{itemUrl}}">{{itemTitle}}</a></li>',
    'pageItemSelectedHtml': '<li class="active"><a>{{itemTitle}}</a></li>',
    'pageItemRemainHtml': '<li class="ellipsis"><a href="#" onclick="return false;">{{itemTitle}}</a></li>',
    'paginateHtml': '{{previous}}{{pageItems}}{{next}}',
  
    // Sorting Template
    'sortingHtml': '<label>' + bcSfFilterConfig.label.sorting + '</label> <select>{{sortingItems}}</select>',
};

BCSfFilter.prototype.buildProductGridItem = function(data) {
    /*** Prepare data ***/
    var images = data.images_info;
    data.price_min *= 100, data.price_max *= 100, data.compare_at_price_min *= 100, data.compare_at_price_max *= 100; // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;

    // Add a specific class for grid item
    var itemImageClass = '';
    if (images.length > 1 && bcSfFilterConfig.custom.variant_rollover) {
        itemImageClass += 'class="product-image view-alt" style="background-image: url(\'' + this.optimizeImage(images[1]['src']) + '\');"';
    } else {
        itemImageClass += 'class="product-image"';
    }
    itemHtml = itemHtml.replace(/{{itemImageClass}}/g, itemImageClass);

    // Add sale label
  	var itemSalePercent = Math.round((1-(data.price_min/data.compare_at_price_min))*100);
  	var itemSaleHTML = '<span class="label sale">' + itemSalePercent + '% OFF!</span>';
    var itemSaleLabel = onSale ? itemSaleHTML : '';
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabel);

    // Add soldOut label
    var itemSoldOutLabel = soldOut ? bcSfFilterTemplate.soldOutLabelHtml : '';
    itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabel);

    // Add Vendor
    var itemVendorHtml = bcSfFilterConfig.custom.show_vendors ? bcSfFilterTemplate.vendorHtml.replace(/{{itemVendorLabel}}/g, data.vendor).replace(/{{itemVendorUrl}}/g, this.buildProductItemVendorUrl(data.vendor)) : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add Thumbnail
    var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src']) : bcSfFilterConfig.general.no_image_url;
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

    // Add Price
    var itemPriceHtml = '';
    if (onSale) {
        if (priceVaries) {
            itemPriceHtml += '<span class="from">' + bcSfFilterConfig.label.from_price + '</span> ';
        }
        itemPriceHtml += '<span class="original-price money">' + this.formatMoney(data.compare_at_price_min, this.moneyFormat) + '</span> ';
        itemPriceHtml += '<span class="money">' + this.formatMoney(data.price_min, this.moneyFormat) + '</span>';
    } else {
        if (priceVaries) {
            itemPriceHtml += '<span class="from">' + bcSfFilterConfig.label.from_price + '</span> ';
        }
        itemPriceHtml += '<span class="money">' + this.formatMoney(data.price_min, this.moneyFormat) + '</span>';
    }
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

    // Add main attribute
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

    return itemHtml;
}

BCSfFilter.prototype.buildProductListItem = function(data) {
    /*** Prepare data ***/
    var images = data.images_info;
    data.price_min *= 100, data.price_max *= 100, data.compare_at_price_min *= 100, data.compare_at_price_max *= 100; // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/

    // Get Template
    var itemHtml = bcSfFilterTemplate.productListItemHtml;

    // Add a specific class for grid item
    var itemImageClass = '';
    if (images.length > 1 && bcSfFilterConfig.custom.variant_rollover) {
        itemImageClass += 'class="product-image view-alt" style="background-image: url(\'' + this.optimizeImage(images[1]['src']) + '\');"';
    } else {
        itemImageClass += 'class="product-image"';
    }
    itemHtml = itemHtml.replace(/{{itemImageClass}}/g, itemImageClass);

    // Add sale label
    
  	var itemSalePercent = Math.round((1-(data.price_min/data.compare_at_price_min))*100);
  	var itemSaleHTML = '<span class="label sale">' + itemSalePercent + '% OFF!</span>';
    var itemSaleLabel = onSale ? itemSaleHTML : '';
    itemHtml = itemHtml.replace(/{{itemSaleLabel}}/g, itemSaleLabel);

    // Add soldOut label
    var itemSoldOutLabel = soldOut ? bcSfFilterTemplate.soldOutLabelHtml : '';
    itemHtml = itemHtml.replace(/{{itemSoldOutLabel}}/g, itemSoldOutLabel);

    // Add sale text
    
  	var itemSalePercent = Math.round((1-(data.price_min/data.compare_at_price_min))*100);
  	var itemSaleHTML = '<span class="sale">' + itemSalePercent + '% OFF!</span>';
    var itemSaleText = onSale ? itemSaleHTML : '';
    itemHtml = itemHtml.replace(/{{itemSaleText}}/g, itemSaleText);

    // Add soldOut text
    var itemSoldOutText = soldOut ? bcSfFilterTemplate.soldOutTextHtml : '';
    itemHtml = itemHtml.replace(/{{itemSoldOutText}}/g, itemSoldOutText);

    // Add Vendor
    var itemVendorHtml = bcSfFilterConfig.custom.show_vendors ? bcSfFilterTemplate.vendorHtml.replace(/{{itemVendorLabel}}/g, data.vendor).replace(/{{itemVendorUrl}}/g, this.buildProductItemVendorUrl(data.vendor)) : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add Thumbnail
    var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src']) : bcSfFilterConfig.general.no_image_url;
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);

    // Add Price
    var itemPriceHtml = '';
    if (soldOut) {
        itemPriceHtml += '<span class="original-price">';
    }
    if (onSale) {
        if (priceVaries) {
            itemPriceHtml += '<span class="from">' + bcSfFilterConfig.label.from_price + '</span> ';
        }
        itemPriceHtml += '<span class="original-price money">' + this.formatMoney(data.compare_at_price_min, this.moneyFormat) + '</span> ';
        itemPriceHtml += '<span class="money">' + this.formatMoney(data.price_min, this.moneyFormat) + '</span>';
    } else {
        if (priceVaries) {
            itemPriceHtml += '<span class="from">' + bcSfFilterConfig.label.from_price + '</span> ';
        }
        itemPriceHtml += '<span class="money">' + this.formatMoney(data.price_min, this.moneyFormat) + '</span>';
    }
    if (soldOut) {
        itemPriceHtml += '</span>';
    }
    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

    // Add Description
    var itemDescription = jQ('<p>' + data.body_html + '</p>').text();
    itemDescription = (itemDescription.split(" ")).length > 40 ? itemDescription.split(" ").splice(0, 40).join(" ") + '...' : itemDescription.split(" ").splice(0, 40).join(" ");
    itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescription);

    // Add main attribute
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

    return itemHtml;
}

// Customize data to suit the data of Shopify API
BCSfFilter.prototype.prepareProductData = function(data) {
    for (var k in data) {
        // Featured image
        if (data['images_info'] > 0) {
            data[k]['featured_image'] = data['images_info'][0];
        } else {
            data[k]['featured_image'] = {width: '', height: '', aspect_ratio: 0}
        }

        // Add Options
        var optionsArr = [];
        for (var i in data[k]['options_with_values']) {
            optionsArr.push(data[k]['options_with_values'][i]['name']);
        }
        data[k]['options'] = optionsArr;

        // Customize variants
        for (var i in data[k]['variants']) {
            var variantOptionArr = [];
            var count = 1;
            var variant = data[k]['variants'][i];
            // Add Options
            var variantOptions = variant['merged_options'];
            if (Array.isArray(variantOptions)) {
                for (var j = 0; j < variantOptions.length; j++) {
                    var temp = variantOptions[j].split(':');
                    data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];
                    data[k]['variants'][i]['option_' + temp[0]] = temp[1];
                    variantOptionArr.push(temp[1]);
                }
                data[k]['variants'][i]['options'] = variantOptionArr;
            }
            data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;
            data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100;
        }

        // Add Description
        data[k]['description'] = data[k]['body_html'];
    }
    return data;
};

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
    // Get page info
    var currentPage = parseInt(this.queryParams.page);
    var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

    // If it has only one page, clear Pagination
    if (totalPage == 1) {
        jQ(this.selector.bottomPagination).html('');
        return false;
    }

    if (this.getSettingValue('general.paginationType') == 'default') {
        var paginationHtml = bcSfFilterTemplate.paginateHtml;

        // Build Previous
        var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousHtml : '';
        previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
        paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

        // Build Next
        var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextHtml : '';
        nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
        paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

        // Create page items array
        var beforeCurrentPageArr = [];
        for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
            beforeCurrentPageArr.unshift(iBefore);
        }
        if (currentPage - 4 > 0) {
            beforeCurrentPageArr.unshift('...');
        }
        if (currentPage - 4 >= 0) {
            beforeCurrentPageArr.unshift(1);
        }
        beforeCurrentPageArr.push(currentPage);

        var afterCurrentPageArr = [];
        for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
            afterCurrentPageArr.push(iAfter);
        }
        if (currentPage + 3 < totalPage) {
            afterCurrentPageArr.push('...');
        }
        if (currentPage + 3 <= totalPage) {
            afterCurrentPageArr.push(totalPage);
        }

        // Build page items
        var pageItemsHtml = '';
        var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
        for (var iPage = 0; iPage < pageArr.length; iPage++) {
            if (pageArr[iPage] == '...') {
                pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
            } else {
                pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
            }
            pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
            pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
        }
        paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

        jQ(this.selector.bottomPagination).html(paginationHtml);
    }
};

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
    if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');

        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content 
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);

            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
        }
    }
};

// Build Display type
BCSfFilter.prototype.buildFilterDisplayType = function() {
    var itemHtml = '<a href="' + this.buildToolbarLink('display', 'list', 'grid') + '" title="Grid view" class="change-view bc-sf-filter-display-grid" data-view="grid"><span class="icon-fallback-text"><span class="icon icon-grid" aria-hidden="true"></span><span class="fallback-text">' + bcSfFilterConfig.label.grid_view + '</span></span></a> ';
    itemHtml += '<a href="' + this.buildToolbarLink('display', 'grid', 'list') + '" title="List view" class="change-view bc-sf-filter-display-list" data-view="list"><span class="icon-fallback-text"><span class="icon icon-list" aria-hidden="true"></span><span class="fallback-text">' + bcSfFilterConfig.label.list_view + '</span></span></a>';
    jQ(this.selector.topDisplayType).html(itemHtml);

    // Active current display type
    jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').removeClass('active');
    jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').removeClass('active');
    if (this.queryParams.display == 'list') {
        jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-list').addClass('active');
    } else if (this.queryParams.display == 'grid') {
        jQ(this.selector.topDisplayType).find('.bc-sf-filter-display-grid').addClass('active');
    }
};


// Add additional class when switch to another layout
BCSfFilter.prototype.buildExtrasProductList = function(data) {
    jQ('#bc-sf-filter-products').removeClass();
    if (this.queryParams.display == 'list') {
        jQ('#bc-sf-filter-products').addClass('products products-list');
    } else {
        jQ('#bc-sf-filter-products').addClass('products products-grid');
    }
};

// Build Additional element
BCSfFilter.prototype.buildAdditionalElements = function(data) {};