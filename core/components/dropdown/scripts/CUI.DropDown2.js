(function ($, window, undefined) {
    CUI.DropDown2 = new Class(/** @lends CUI.DropDown2# */{
        toString: 'DropDown2',

        extend: CUI.Widget,

        defaults: {
            type: 'static',
            nativewidget: false,
            nativewidgetonmobile: true,
            selectlistConfig: null
        },

        construct: function () {
            var self = this;

            // find elements
            this._button = this.$element.children('input[type=button]');
            this._select = this.$element.children('select');
            this._selectList = this.$element.children('selectlist');
            this._valueInput = this.$element.children('input[type=hidden]');

            // apply
            this.applyOptions();
        },

        applyOptions: function () {
            if (this.options.nativewidget) {
                this._setNativeWidget();
            } else {
                this._setSelectList();
            }
        },

        /**
         * this option is mainly supposed to be used on mobile
         * and will just work with static lists
         * @private
         * @param {Boolean} [force]
         */
        _setNativeWidget: function (force) {
            var self = this;

            if (this.options.nativewidget || force) {
                this._select.css({
                    display: 'block',
                    width: this._button.outerWidth(),
                    height: this._button.outerHeight(),
                    opacity: 0.01
                });

                this._select.position({
                    my: 'left top',
                    at: 'left top',
                    of: this._button
                });

                this._select.on('change.dropdown', function (event) {
                    self._button.val(self._select.children('option:selected').text());
                });
            } else {
                this._select.off('change.dropdown');
            }
        },

        /**
         * parses values from a select lsit
         * @private
         * @return {Array} 
         */
        _parseValues: function () {
            var values = [];

            // loop over all elements and add to array
            this._select.children('option').each(function (i, e) {
                var opt = $(e);

                values.push({
                    display: opt.text(),
                    value: opt.val()
                });
            });

            return values;
        },

        _setSelectList: function () {
            var self = this;

            // if the element is not there, create it
            if (this._selectList.length === 0) {
                this._selectList = $('<ul/>', {
                    'class': 'selectlist'
                }).appendTo(this.$element);
            }

            this._selectList.selectList($.extend({
                relatedElement: this._button
            }, this.options.selectlistConfig || {}));

            this._selectListWidget = this._selectList.data('selectList');

            // if a <select> is given we are handling a static list
            // otherwise it is dynamic
            if (this._select.length > 0) {
                this._selectListWidget.set('values', this._parseValues());
            } else {
                this._selectListWidget.set('type', 'dynamic');
            }

            // handler to open usggestion box
            this._button.fipo('tap', 'click', function (event) {
                event.preventDefault();
                self._toggleList();
            }).finger('click', false);


            this._selectList
                // receive the value from the list
                .on('selected.dropdown', this._handleSelected.bind(this))
                // handle open/hide for the button
                .on('show.dropdown hide.dropdown', function (event) {
                    self._button.toggleClass('active', event.type === 'show');
                });
        },

        _handleSelected: function (event) {
            this._button.val(event.displayedValue);
            this._select.val(event.selectedValue);
            this._valueInput.val(event.selectedValue);

            this._button.trigger('focus');
        },

        _toggleList: function () {
            this._selectListWidget.toggleVisibility();
        }
    });

    CUI.util.plugClass(CUI.DropDown2);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).on('cui-contentloaded.data-api', function (e) {
            $('[data-init~=dropdown2]', e.target).dropDown2();
        });
    }

}(jQuery, this));