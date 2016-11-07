var PagerCollection = Backbone.Collection.extend({
  lastPage: null,
  errorMessage: null,
  initialize: function (cl, options) {
    this.options = options;
    this.url = this.options.url;
  },
  parse: function (response) {
    this.lastPage = response.LastPage;
    this.errorMessage = response.ErrorMessage;
    return response;
  }
});

var CofidisPagerView = Backbone.View.extend({
  $firstBtn: null,
  $nextBtn: null,
  $previousBtn: null,
  $lastBtn: null,
  $tbody: null,
  template: null,
  currentPage: 1,
  lastPage: null,
  initialize: function (options) {
    this.options = options;

    this.cacheUI();
    this.template = _.template($(this.options.templateMarkup).html());

    this.collection = new PagerCollection(null, { url: this.options.url, tbody: this.options.tbody, templateMarkup: this.options.templateMarkup });

    this.listenTo(this.collection, 'sync', this.render);
    this.listenTo(this.collection, 'error', this.error);

    this.loadData();
  },
  cacheUI: function () {
    this.$loader = this.$('#loading');
    this.$tbody = this.$(this.options.tbody);
    this.$firstBtn = this.$("[data-fn='First']");
    this.$nextBtn = this.$("[data-fn='Next']");
    this.$previousBtn = this.$("[data-fn='Previous']");
    this.$lastBtn = this.$("[data-fn='Last']");
  },
  error: function () {
    this.collection.errorMessage = "An error occurred!";
  },
  events: {
    'click .btn-nav': 'navigate',
    'click .btn-search': 'search',
  },
  render: function () {
    var _self = this;
    var errorMsg = this.collection.errorMessage;

    //do error treatment
    if (errorMsg)
      return false;

    this.$tbody.empty();

    //send BackboneJS model to DOM
    _.each(this.collection.models, function (model) {
      _self.$tbody.append(_self.template({ md: model }));
    });

    //if there's no data the last and current page is the first
    if (!this.collection.models.length) {
      this.lastPage = 1;
      this.currentPage = 1;
    }
    else
      this.lastPage = this.collection.lastPage;

    this.hideShowNav();
    this.$loader.hide();
  },
  search: function () {
    this.currentPage = 1; //sets current page to 1
    this.loadData();
  },
  navigate: function (e) {
    var op = this.$(e.currentTarget).data('fn');

    if (this.lastPage == null) //since the first load comes from server side
      this.lastPage = parseInt(this.$('#lastPage').val());

    if (op === 'First') { this.currentPage = 1; }
    else if (op === 'Last') { this.currentPage = this.lastPage; }
    else if (op === 'Previous') { this.currentPage -= 1; }
    else if (op === 'Next') { this.currentPage += 1; }

    this.loadData(); //reload data
  },
  loadData: function () {
    this.$loader.show();

    this.collection.fetch({
      data: { currentPage: this.currentPage });
    },
    hideShowNav: function () {
      if (this.currentPage === 1 && this.lastPage === 1) { //first page is the last
        this.$firstBtn.attr('disabled', true);
        this.$previousBtn.attr('disabled', true);
        this.$nextBtn.attr('disabled', true);
        this.$lastBtn.attr('disabled', true);
      }
      else if (this.currentPage === this.lastPage) { //last page of table
        this.$firstBtn.removeAttr('disabled', true);
        this.$previousBtn.removeAttr('disabled', true);
        this.$nextBtn.attr('disabled', true);
        this.$lastBtn.attr('disabled', true);
      }
      else if (this.currentPage === 1) { //first page of table
        this.$firstBtn.attr('disabled', true);
        this.$previousBtn.attr('disabled', true);
        this.$nextBtn.removeAttr('disabled', true);
        this.$lastBtn.removeAttr('disabled', true);
      }
      else { //normal paging
        this.$firstBtn.removeAttr('disabled', true);
        this.$previousBtn.removeAttr('disabled', true);
        this.$nextBtn.removeAttr('disabled', true);
        this.$lastBtn.removeAttr('disabled', true);
      }
    },
  });

  var pagerApp;
  $(function () {
    pagerApp = new CofidisPagerView({
      el: '.content',
      url: 'movimentos/GetData',
      tbody: '.table-cars',
      templateMarkup: '#template'
    });
  });
