
interface Tab {
	name: string
	id: number
}
interface TabsOptions {
	contariner: HTMLElement
	tabs: Tab []
	onClickAddTab: Function
	onClickTab: Function
	onClickArrowLeft?: Function
	onClickArrowRight?: Function
}

class Tabs {
	constructor(options: TabsOptions) {
		this.contariner = options.contariner
		this.options = options
		this.tabs = options.tabs || []
		this.createSheetTabs()
	}
	options: TabsOptions
	contariner: HTMLElement
	selectedIndex: number = 0
	tabs: Tab []
	tabsInner: any
	tabWapper: any
	// 创建底部SheetTab
	private createSheetTabs = () => {
		const tabs = `
        <div class='mg-tabs'>
            <div class='mg-tabs-arrow'>
                <span class='mg-tabs-arrow-left'>
                    <div class='mg-tabs-arrow-left-item'></div>
                </span>
                <span class='mg-tabs-arrow-right'>
                    <div class='mg-tabs-arrow-right-item'></div>
                </span>
            </div>
            <div class='mg-tabs-wapper'>
                <div class='mg-tabs-inner'></div>
            </div>
            <div class='mg-tabs-add' id='mgTabsAddBtn'>
                <span class='mg-tabs-add-line1'></span>
                <span class='mg-tabs-add-line2'></span>
            </div>
        </div>
    `
		this.contariner.innerHTML = tabs

		const mgTabsAddBtn: any = document.getElementById('mgTabsAddBtn')
		mgTabsAddBtn.addEventListener('click', this.options.onClickAddTab)

		const arrowLeft: any = document.querySelector('.mg-tabs-arrow-left')
		arrowLeft.addEventListener('click', this.onClickArrowLeft)

		const arrowRight: any = document.querySelector('.mg-tabs-arrow-right')
		arrowRight.addEventListener('click', this.onClickArrowRight)

		this.tabWapper = document.querySelector('.mg-tabs-wapper')
	}
	public addTab = (tab: Tab, index?: number) => {
		let i = index >= 0 ? index : this.tabs.length
		this.tabs.splice(i, 0, tab)
		this.selectedIndex = i
		this.updateTabs()
		this.updateTabsClass()
	}
	private onClickTab = (e) => {
		const index = Number(e.target.getAttribute('data-index'))
		this.options.onClickTab(index)
		this.selectedIndex = index
		this.updateTabsClass()
		this.scrollViewRange()
	}
	private updateTabs = () => {
		const tabsInner = document.querySelectorAll('.mg-tabs-inner')[0];
		if (tabsInner) {
			let html = ''
			this.tabs.forEach((sheet, index) => {
				html += `<div class='mg-tabs-item' data-index=${index}>${sheet.name}</div>`
			})
			tabsInner.innerHTML = html
			this.tabsInner = tabsInner
			tabsInner.removeEventListener('click', this.onClickTab)
			tabsInner.addEventListener('click', this.onClickTab)
			this.scrollViewRange()
		}
	}
	private updateTabsClass = () => {
		if (this.tabs.length === 0) return
		const items = document.querySelectorAll('.mg-tabs-item')

		items.forEach((item, index) => {
			item.className = 'mg-tabs-item'
			if (index === this.selectedIndex) {
				item.className += ' mg-tabs-item-active'
			}
		})
	}
	private getMovePx = (dom?: any) => {
		const rect = this.tabWapper.getBoundingClientRect()
		let cur = dom
		if (!dom) {
			cur = document.querySelectorAll('.mg-tabs-item')[this.selectedIndex].getBoundingClientRect()
		}
		if (cur.right > rect.right) {
			return rect.right - cur.right
		}
		if (cur.left < rect.left) {
			return rect.left - cur.left
		}
		return 0
	}
	private scrollViewRange = () => {
		let left = this.tabsInner.style.left.split('px')[0]
		left = Number(left) + this.getMovePx()
		this.tabsInner.style.left = `${left}px`
	}
	private onClickArrowLeft = () => {
		let left = Number(this.tabsInner.style.left.split('px')[0]) + 100
		if (left > 0) {
			left = 0
		}
		this.tabsInner.style.left = `${left}px`
		this.options.onClickArrowLeft && this.options.onClickArrowLeft()
	}
	private onClickArrowRight = () => {
		const wapperWidth = this.tabWapper.offsetWidth
		const innerWidth = this.tabsInner.offsetWidth
		let left = Number(this.tabsInner.style.left.split('px')[0])
		if (Math.abs(left) + wapperWidth < innerWidth) {
			left -= 100
		}
		this.tabsInner.style.left = `${left}px`
		this.options.onClickArrowRight && this.options.onClickArrowRight()
	}
}

export default Tabs