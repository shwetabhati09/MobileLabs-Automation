'######################################################################################

'Objective:		To demonstrate cross platform scripting for nativeautomation
'Pre-requisite:	For iOS make sure the certificate used to sign the ipa is trusted by the device
'				Upload and rename the iOS Geico app to "Geico" and Android app to "GEICO Mobile_Obfuscated"
'				Provide path to CLI in the CLIPath variable, also enter HubAddress, UserName, Pwd, DeviceID. Rest can be left as default
'######################################################################################

RegisterUserFunc "MobiElement", "Click", "ClickHighlight"
RegisterUserFunc "MobiButton", "Click", "ClickHighlight"

'Provide device connection params here
CLIPath = "C:\Users\Naveen\Desktop\dC_CLIMaster"
HubAddress = "10.10.0.33"
UserName = "naveen@mlabs.com"
Pwd = "deviceconnect"
DeviceID = "Device3"
applicationname="deviceControl"
orientation="Portrait"
scale="100"

'Connect device
SystemUtil.CloseProcessByName "MobileLabs.deviceViewer.exe"
SystemUtil.CloseProcessByName "MobileLabs.DeviceConnect.Cli.exe"
connectParams = HubAddress & " " & UserName & " " & Pwd _
& " -device " & DeviceID _
& " -release"
SystemUtil.Run "MobileLabs.DeviceConnect.Cli.exe", connectParams,CLIPath	
	
WaitForProcess("MobileLabs.DeviceConnect.Cli.exe")
connectParams = HubAddress & " " & UserName & " " & Pwd _
& " -device " & DeviceID _
& " -scale " & scale _
& " -orientation " & orientation _
& " -nativeautomation " _
& " -run " & applicationname
Reporter.ReportEvent micDone, "ConnectToDevice", "Connect Parameters: " & connectParams		
SystemUtil.Run "MobileLabs.DeviceConnect.Cli.exe", connectParams,CLIPath
WaitForProcess("MobileLabs.DeviceConnect.Cli.exe")

'Wait for the device to connect
Window("deviceViewer").WaitProperty "height", micGreaterThan(300), 30000

'Resize the viewer
blnResult = FitViewerIntoDesktop
If Not(blnResult) Then
	MsgBox "Couldn't resize the viewer, please resize the scale to fit your desktop and continue!"
Else
	Print "Device connected and viewer successfully resized!"
	Wait 2
End If

'#################################################
'Get device OS
strOS = LCase(MobiDevice("deviceControl").GetROProperty("platform"))

'#################################################

'Close the iTunes signin dialog if it is present
If strOS = "ios" Or strOS = "iphone os" Then
	If MobiDevice("iOS").MobiElement("SignIntoiTunesStore").Exist(20) Then
		MobiDevice("iOS").MobiButton("Cancel").Click
		Print "iTunes popup closed!"
	End If
	
	'Handle the iOS update dialog
	If MobiDevice("iOS").MobiElement("SoftwareUpdate").Exist(10) Then
		If MobiDevice("iOS").MobiButton("Later").Exist(5) Then
			MobiDevice("iOS").MobiButton("Later").Click
		End If
		Wait 2
		If MobiDevice("iOS").MobiButton("RemindMeLater").Exist(5) Then
			MobiDevice("iOS").MobiButton("RemindMeLater").Click
		End If
		Print "iOS update popup closed!"
	End If
End If

If MobiDevice("deviceControl").MobiElement("WelcometodeviceControl").Exist(20) Then
	MobiDevice("deviceControl").MobiElement("WelcometodeviceControl").Highlight
	MobiDevice("deviceControl").ButtonPress eHOME
Else
	Print "Failed to connect to device!"
End If

'Install Geico app
Select Case strOS
	Case "iphone os"
		appName = "Geico"
	Case "ios"
		appName = "Geico"
	Case "androidos"
		appName = "GEICO Mobile_Obfuscated"
'	Case "android"
'		appName = "GEICO Mobile_Obfuscated"
	Case Else
		MsgBox "Couldn't get device platform, exiting test!"
		ExitTest
End Select

Print "Installing app: " & appName

connectParams = HubAddress & " " & UserName & " " & Pwd _
& " -device " & DeviceID _
& " -nativeautomation " _
& " -install " & appName
Reporter.ReportEvent micDone, "InstallApp", "Connect Parameters: " & connectParams		
SystemUtil.Run "MobileLabs.DeviceConnect.Cli.exe", connectParams,CLIPath
WaitForProcess("MobileLabs.DeviceConnect.Cli.exe")

Print "App installed: " & appName

'#################################################
'WiFi
openDeviceSettings
strOS = LCase(MobiDevice("deviceControl").GetROProperty("platform"))
If strOS = "iphone os" Then
	strOS = "ios"
ElseIf strOS = "androidos" Then
	strOS = "android"
End If

Print "WiFi screen steps!"
Select Case strOS
	Case "ios"
		MobiDevice("iOS").MobiElement("WiFi").WaitProperty "visible", True, 5000
		MobiDevice("iOS").MobiElement("WiFi").Click
		MobiDevice("iOS").MobiElement("WiFi").WaitProperty "visible", False, 5000
		MobiDevice("iOS").MobiElement("MobileLabs").Click
		Wait 3
		If MobiDevice("iOS").MobiButton("WiFi").Exist(3) Then
			MobiDevice("iOS").MobiButton("WiFi").Click
			Wait 3
		ElseIf MobiDevice("iOS").MobiButton("Cancel_WiFi").Exist(3) Then
			MobiDevice("iOS").MobiButton("Cancel_WiFi").Click
			Wait 3
		End If
		
		MobiDevice("iOS").MobiElement("Other").Click
		Wait 4
		MobiDevice("iOS").MobiButton("Cancel_WiFi").Click
		Wait 3
		MobiDevice("iOS").ButtonPress eHOME
		Wait 3
		
	Case "android"
		Set objWifi = MobiDevice("deviceControl").MobiElement("WiFi")
		intTries = 0
		Do While Not(objWifi.Exist(2))
			MobiDevice("deviceControl").Swipe eUP, eMEDIUM, 30, 60
			Wait 2
			intTries = intTries + 1
			If MobiDevice("deviceControl").MobiElement("Wi-Fi").Exist(2) Then
				Set objWifi = MobiDevice("deviceControl").MobiElement("Wi-Fi")
			End If
			If intTries > 5 Then
				Exit Do
			End If
		Loop
		
		If objWifi.Exist(1) Then
			objWifi.Click
			Wait 3
		Else
			Print "Can't find WiFi in Settings, something went wrong, exiting test. Please check the device!"
			ExitTest
		End If
		
		If MobiDevice("deviceControl").MobiElement("WiFi_Tutorial").Exist(3) Then
			MobiDevice("deviceControl").MobiButton("CLOSE").Click
		End If
		
		MobiDevice("deviceControl").MobiElement("MobileLabs").Click
		Wait 2
		
		If MobiDevice("deviceControl").MobiCheckbox("Showpassword").Exist(3) Then
			MobiDevice("deviceControl").MobiEdit("Password").Set "Pyramid@892!"
			Wait 1
		End If
		
		If MobiDevice("deviceControl").MobiButton("CONNECT").Exist(5) Then
			MobiDevice("deviceControl").MobiButton("CONNECT").Click
			MobiDevice("deviceControl").MobiElement("ObtainingIPaddress").WaitProperty "width",0,10000
		ElseIf MobiDevice("deviceControl").MobiButton("CANCEL").Exist(5) Then
			MobiDevice("deviceControl").MobiButton("CANCEL").Click
		End If

		If MobiDevice("deviceControl").MobiElement("dCMacmini2").Exist(3) Then
			MobiDevice("deviceControl").MobiElement("dCMacmini2").Click
			Wait 2
		End If
		
		If MobiDevice("deviceControl").MobiCheckbox("Showpassword").Exist(3) Then
			MobiDevice("deviceControl").MobiEdit("Password").Set "123456789"
			If MobiDevice("deviceControl").MobiButton("CONNECT").GetROProperty("enabled") = True Then
				MobiDevice("deviceControl").MobiButton("CONNECT").Click
			End If
			Wait 1
		ElseIf MobiDevice("deviceControl").MobiButton("CANCEL").Exist(5) Then
			MobiDevice("deviceControl").MobiButton("CANCEL").Click
		End If
		
		MobiDevice("deviceControl").ButtonPress eBACK
		Wait 2
		
	Case Else
		MsgBox "Couldn't get device platform, exiting test!"
		ExitTest
End Select




'#################################################
'Force stop Geico app if it is running - Android only
If strOS = "android" Then
	Print "Force stopping Geico app!"
	openDeviceSettings
	
	intTries = 0
	Do While Not(MobiDevice("deviceControl").MobiElement("Apps").Exist(2))
		MobiDevice("deviceControl").Swipe eDOWN, eMEDIUM, 30, 60
		Wait 3
		intTries = intTries + 1
		If intTries > 5 Then
			Exit Do
		End If
	Loop
	
	If MobiDevice("deviceControl").MobiElement("Apps").Exist(1) Then
		MobiDevice("deviceControl").MobiElement("Apps").Click
	Else
		Print "Can't find Apps in Settings, something went wrong, exiting test. Please check the device!"
		ExitTest
	End If
	
	Wait 3
	MobiDevice("deviceControl").Type "geico"
	Wait 4
	MobiDevice("deviceControl").MobiList("AppList").MobiElement("GEICOMobile").Click
	
	If MobiDevice("deviceControl").MobiButton("FORCESTOP").GetROProperty("enabled") = True Then	
		MobiDevice("deviceControl").MobiButton("FORCESTOP").Click
		Wait 2
		If MobiDevice("deviceControl").MobiButton("OK").Exist(3) Then
			MobiDevice("deviceControl").MobiButton("OK").Click
		ElseIf MobiDevice("deviceControl").MobiButton("FORCESTOP").Exist(2) Then
			MobiDevice("deviceControl").MobiButton("FORCESTOP").Click
		End If
		Wait 2
		
		If MobiDevice("deviceControl").MobiButton("FORCESTOP").GetROProperty("enabled") = False Then	
			Print "Geico app stopped successfully!"
		End If
	Else
		Print "Geico app not running!"
	End If
	
	MobiDevice("deviceControl").ButtonPress eHOME
	Wait 3 @@ hightlight id_;_2_;_script infofile_;_ZIP::ssf3.xml_;_
End If

'#################################################
'Launch App and browse through some screens
Select Case strOS
	Case "ios"
		Print "Checking if app is verified or not!"
	
		'First verify the app
		openDeviceSettings
		
		'Tap General
		If Not(MobiDevice("iOS").MobiList("SettingsList").MobiElement("GeneralListItem").Exist(5)) Then
			MobiDevice("deviceControl").Swipe eDOWN, eMEDIUM, 30, 50
		End If
		
		MobiDevice("iOS").MobiList("SettingsList").MobiElement("GeneralListItem").Click

		'Scroll to the bottom of General screen and click Device Management
		MobiDevice("iOS").MobiElement("GeneralTitle").WaitProperty "visible", True, 5000

		If LCase(MobiDevice("iOS").GetROProperty("devicetype")) = "ipad" Then
			MobiDevice("iOS").MobiList("SettingsListRight").Scroll eBOTTOM
		Else
			MobiDevice("iOS").MobiList("SettingsList").Scroll eBOTTOM
		End If	
		Wait 3
		
'		MobiDevice("iOS").MobiElement("DeviceManagement").highlight
		MobiDevice("iOS").MobiElement("DeviceManagement").Click
		
		'Select Cert and Trust it
		If MobiDevice("iOS").MobiElement("GovernmentEmployeesInsuranceCo").Exist(5) Then
			MobiDevice("iOS").MobiElement("GovernmentEmployeesInsuranceCo").Click
			
			If MobiDevice("iOS").MobiElement("TrustGovernmentEmployeesInsura").Exist(5) Then
				MobiDevice("iOS").MobiElement("TrustGovernmentEmployeesInsura").Click
				
				If MobiDevice("iOS").MobiButton("Trust").Exist(5) Then
					MobiDevice("iOS").MobiButton("Trust").Click
					Print "Certificate trusted!"
					
					'Goto Home
					MobiDevice("iOS").ButtonPress eHOME
					Wait 2
				End If
				
			End If
			Print "App verified!"
		End If
	
		'Open the search screen by swiping down on home screen
		Print "Launching Geico app!"
		MobiDevice("deviceControl").ButtonPress eHOME
		Wait 3
		MobiDevice("deviceControl").Draw "down(50%,30%) move(50%,60%,duration=2s) up()"
		MobiDevice("iOS").MobiEdit("Search").WaitProperty "visible", True, 50000
		MobiDevice("iOS").MobiEdit("Search").Clear
		If MobiDevice("iOS").MobiEdit("Search").Exist(5) Then
			MobiDevice("iOS").MobiEdit("Search").Set "G4"
			MobiDevice("iOS").MobiElement("G475776").WaitProperty "visible", True, 5000
			MobiDevice("iOS").MobiElement("G475776").Click
		Else
			Print "Search screen not opened, exiting Test!"
			ExitTest
		End If
		
		If  MobiDevice("iOS").MobiElement("Notificationsmayincludealertss").Exist(10) Then
			If MobiDevice("iOS").MobiButton("OK").Exist(5) Then
				MobiDevice("iOS").MobiButton("OK").Click
			ElseIf MobiDevice("iOS").MobiButton("Allow").Exist(5) Then
				MobiDevice("iOS").MobiButton("Allow").Click
			End If
			Wait 2
		End If
		
		
	Case "android"
		Print "Launching Geico app!"
		MobiDevice("deviceControl").ButtonPress eHOME
'		MobiDevice("deviceControl").MobiElement("AppsIcon").Click
'		Wait 3
		If MobiDevice("deviceControl").MobiElement("SayOkGoogle").Exist(5) Then
			MobiDevice("deviceControl").MobiElement("SayOkGoogle").Click
		ElseIf MobiDevice("deviceControl").MobiImage("GoogleMikeIcon").Exist(5) Then
			MobiDevice("deviceControl").MobiImage("GoogleMikeIcon").Click -10,10
		End If
			
		If MobiDevice("deviceControl").MobiButton("SKIP").Exist(5) Then
				MobiDevice("deviceControl").MobiButton("SKIP").Click
		End If
		
		MobiDevice("deviceControl").Type "Geico"
		MobiDevice("deviceControl").MobiElement("GEICOMobile").WaitProperty "visible", True, 10000
		
		MobiDevice("deviceControl").MobiElement("GEICOMobile").Click
		
		If MobiDevice("GEICO Mobile").MobiButton("ALLOW").Exist(5) Then
			MobiDevice("GEICO Mobile").MobiButton("ALLOW").Click
			intAttempts = 0
			Do While MobiDevice("GEICO Mobile").MobiButton("ALLOW").Exist(5)
				MobiDevice("GEICO Mobile").MobiButton("ALLOW").Click
				Wait 2
				If intAttempts > 5 Then
					Exit Do
				End If
				intAttempts = intAttempts + 1
			Loop
		ElseIf MobiDevice("GEICO Mobile").MobiElement("Element").MobiElement("RequestError").Exist(5) Then
				MobiDevice("deviceControl").MobiButton("OK").Click
		ElseIf MobiDevice("deviceControl").MobiButton("NOCOMMENT").Exist(5) Then
			MobiDevice("deviceControl").MobiButton("NOCOMMENT").Click
		End If
End Select

strCase = ""
If MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("UserIDEmailPolicyNumber").Exist(10) Then
	strCase = "case1"
ElseIf MobiDevice("GEICO Mobile").MobiImage("GeicoTitle").Exist(5) Then
	strCase = "case2"
ElseIf MobiDevice("GEICO Mobile").MobiImage("GeicoTitle_iOS").Exist(5) Then
	strCase = "case2"
End If

'Select Case LCase(MobiDevice("deviceControl").GetROProperty("devicetype"))
Select Case strCase

'	Case "nexus 6"
	Case "case1"
		If MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("UserIDEmailPolicyNumber").Exist(5) Then
			Print "Geico app launched successfully!"
			
			'Enter UserId and password
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("UserIDEmailPolicyNumber").Set "TestingText!@#$$3223"
			Wait 2
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Password").Set "Test123!@#"
			
			'Show password
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiSwitch("ShowPassword").Set eACTIVATE
			
			If Not(MobiDevice("GEICO Mobile").MobiElement("Element").MobiElement("AccidentAssistance").Exist(2)) Then
				Print "Closing Keypad!"
				MobiDevice("GEICO Mobile").ButtonPress eBACK
				Wait 3
			End If

			MobiDevice("GEICO Mobile").MobiElement("Element").MobiElement("AccidentAssistance").Click
			If MobiDevice("GEICO Mobile").MobiElement("AccidentAssistanceScreen").Exist Then
				MobiDevice("GEICO Mobile").MobiElement("AccidentAssistanceScreen").Highlight
				Print "Accident assistance screen loaded successfully!"
				Wait 2
			End If
			
			'Go back to login screen
			MobiDevice("GEICO Mobile").ButtonPress eBACK
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("UserIDEmailPolicyNumber").WaitProperty "visible", True, 10000
			
			'Go to Signup screen
			MobiDevice("GEICO Mobile").MobiButton("SIGNUPFORANACCOUNT").Click
			Wait 2
			
			If MobiDevice("GEICO Mobile").MobiElement("Element").MobiElement("RequestError").Exist(3) Then
				MobiDevice("deviceControl").MobiButton("OK").Click
			End If
			
			'Enter data into Activate Account form
			'Enter policy number
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("PolicyNum").Set "007007"
			
			'Select each month one by one and enter day and year
			selectMonth
			
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Day").Set "11"
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Year").Set "2011"
			Wait 2
			
			'Enter zip
			MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("ZipCode").Set "30091"
			
			'Close app by pressing Home button
			MobiDevice("GEICO Mobile").ButtonPress eHOME
			Print "Closing app by pressing HOME!"
			Wait 1
		Else
			Print "Geico app did not launch!"
			Reporter.ReportEvent micFail, "App launch", "Geico app did not launch!"
		End If
'	Case "nexus 5x"
	Case "case2"
		Print "Geico app launched successfully!"
		Select Case strOS
			Case "ios"
				Set objImage = MobiDevice("GEICO Mobile").MobiImage("GeicoTitle_iOS")
				Wait 2
				If MobiDevice("GEICO Mobile").MobiElement("Howwasyourexperience").Exist(10) Then
					MobiDevice("GEICO Mobile").MobiButton("Nocomment").Click
					Wait 2	
				End If
				
			Case "android"
				Set objImage = MobiDevice("GEICO Mobile").MobiImage("GeicoTitle")
		End Select
		
		objImage.WaitProperty "width",micGreaterThan(0),10000
		
		If objImage.Exist(5) Then
			objImage.Highlight
			MobiDevice("GEICO Mobile").MobiButton("GETAQUOTE").Click
			Wait 5
			MobiDevice("GEICO Mobile").MobiElement("AutoInsurance").Click
			Wait 5
			
			Select Case strOS
				Case "ios"
					Set objCarIcon = MobiDevice("GEICO Mobile").MobiImage("CarIcon_iOS")
				Case "android"
					Set objCarIcon = MobiDevice("GEICO Mobile").MobiElement("Element").MobiImage("CarIcon")
			End Select
			
			If objCarIcon.Exist(5) Then
				objCarIcon.Highlight
				Print "Auto insurance screen loaded successfully!"
				
				'Go back to the Home screen
				goToHomeScreen
			End If
			
			'Go to Signup screen
			MobiDevice("GEICO Mobile").MobiButton("SIGNUPFORANACCOUNT").Click
			
			Select Case strOS
			Case "ios"
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("PolicyNum_iOS").Set "007007"
				Wait 2
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("DOB_iOS").Click
				Wait 2
				MobiDevice("GEICO Mobile").MobiDatetimePicker("DatetimePicker").Select "1989-01-22"
				Wait 2
				MobiDevice("GEICO Mobile").MobiButton("Done").Click
				Wait 2
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Zip_iOS").Set "30091"
				
			Case "android"
				If MobiDevice("GEICO Mobile").MobiElement("Element").MobiElement("RequestError").Exist(3) Then
					MobiDevice("deviceControl").MobiButton("OK").Click
				End If
				
				'Enter data into Activate Account form
				'Enter policy number
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("PolicyNum").Set "007007"
				
				'Select each month one by one and enter day and year
				selectMonth
				
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Day").Set "11"
				MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("Year").Set "2011"
				Wait 2
				
				If Not(MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("ZipCode").Exist(2)) Then
					MobiDevice("GEICO Mobile").Draw "down(50%,40%) move(50%,20%) up()"
					Wait 1
					MobiDevice("GEICO Mobile").MobiElement("Element").MobiEdit("ZipCode").Set "30091"
				End If
				
			End Select
			
			
			'Close app by pressing Home button
			MobiDevice("GEICO Mobile").ButtonPress eHOME
			Print "Closing app by pressing HOME!"
			Wait 1
		Else
			Print "Geico app did not launch!"
			Reporter.ReportEvent micFail, "App launch", "Geico app did not launch!"
		End If
		
	Case Else
		Print "Geico app did not launch!"
		Reporter.ReportEvent micFail, "App launch", "Geico app did not launch!"
	
End Select

'Go to Home
MobiDevice("deviceControl").ButtonPress eHOME

Select Case strOS
	Case "ios"
		Set objHomeElement = MobiDevice("deviceControl").MobiElement("iOSSettingsIcon")
	Case "android"
		If MobiDevice("deviceControl").MobiElement("SayOkGoogle").Exist(3) Then
			Set objHomeElement = MobiDevice("deviceControl").MobiElement("SayOkGoogle")
		ElseIf MobiDevice("deviceControl").MobiImage("GoogleMikeIcon").Exist(3) Then
			Set objHomeElement = MobiDevice("deviceControl").MobiImage("GoogleMikeIcon")
		End If
		
End Select

Wait 2

If objHomeElement.Exist(5) Then
	Print "Home screen displayed!"
	objHomeElement.Highlight
End If

'Destroy all objects
Set objImage = Nothing
Set objCarIcon = Nothing
Set objHomeElement = Nothing

'#################################################Functions#################################################

Function WaitForProcess(strProcessName)
	'Wait for the process to complete
	Set objWMI = GetObject("winmgmts:{impersonationLevel=impersonate}!\\.\root\cimv2")
	
	Set colItems = objWMI.ExecQuery("Select * From Win32_Process Where Name = '" & strProcessName & "'")
	intWait = 0

	Do While colItems.Count > 0
		Set colItems = Nothing
		Set colItems = objWMI.ExecQuery("Select * From Win32_Process Where Name = '" & strProcessName & "'")
		wait 3
		intWait = intWait + 5
		If intWait = 150 Then
			Exit Do
		End If
	Loop
		
	Set objWMI = Nothing
	Set colItems = Nothing
End Function


'#################################################

Sub selectMonth
	arrMonths = Array("January","December","February","November","March","October","April","September","May","August","June","July")

	For i = 0 To UBound(arrMonths)
		MobiDevice("GEICO Mobile").MobiElement("Element").MobiDropdown("Month").Click
		Wait 2
		
		strMonthToSelect = arrMonths(i)
		intMonthToSelect = Month(DateValue("22-" & strMonthToSelect & "-2000"))
		
		MobiDevice("GEICO Mobile").MobiElement("TopMonth").Highlight
		strTopMonth = MobiDevice("GEICO Mobile").MobiElement("TopMonth").GetROProperty("text")
		intTopMonth = Month(DateValue("22-" & strTopMonth & "-2000"))
		
		If MobiDevice("GEICO Mobile").MobiElement("BottomMonth_3").Exist(2) Then
			Set objBottomMonth = MobiDevice("GEICO Mobile").MobiElement("BottomMonth_3")
		Else
			If MobiDevice("GEICO Mobile").MobiElement("BottomMonth").Exist(2) Then
				Set objBottomMonth = MobiDevice("GEICO Mobile").MobiElement("BottomMonth")
			Else
				If MobiDevice("GEICO Mobile").MobiElement("BottomMonth_2").Exist(2) Then
					Set objBottomMonth = MobiDevice("GEICO Mobile").MobiElement("BottomMonth_2")
				End If
			End If
		End If
		
		objBottomMonth.Highlight
		strBottomMonth = objBottomMonth.GetROProperty("text")
		intBottomMonth = Month(DateValue("22-" & strBottomMonth & "-2000"))
		
		If intMonthToSelect <= intBottomMonth AND intMonthToSelect >= intTopMonth Then
			MobiDevice("GEICO Mobile").MobiList("Months").Select strMonthToSelect
			Wait 1
		ElseIf intMonthToSelect < intTopMonth Then
			MobiDevice("GEICO Mobile").MobiList("Months").Swipe eUP, eMEDIUM, 20, 80
			Wait 2
			MobiDevice("GEICO Mobile").MobiList("Months").Select strMonthToSelect
		ElseIf intMonthToSelect > intBottomMonth Then
			MobiDevice("GEICO Mobile").MobiList("Months").Swipe eDOWN, eMEDIUM, 20, 80
			Wait 2
			MobiDevice("GEICO Mobile").MobiList("Months").Select strMonthToSelect
		End If
		Wait 2
		strSelectedMonth = MobiDevice("GEICO Mobile").MobiElement("Element").MobiDropdown("Month").MobiElement("MonthValue").GetROProperty("text")
		Print "Passed in month was <" & strMonthToSelect & "> and selected month is <" & strSelectedMonth & ">"
	Next
End Sub

'#################################################

Sub openDeviceSettings
	strPlatform = LCase(MobiDevice("deviceControl").GetROProperty("platform"))
	If strPlatform = "iphone os" Then
		strPlatform = "ios"
	ElseIf strPlatform = "androidos" Then
		strPlatform = "android"
	End If

	Select Case strPlatform
		Case "ios"
'			Set objSettingsIcon = MobiElement("accessibilitylabel:=Settings","nativebaseclass:=UIView")
			Set objSettingsIcon = MobiDevice("deviceControl").MobiElement("iOSSettingsIcon")

			blnFound = False
			If Not(objSettingsIcon.Exist(5)) Then
				MobiDevice("deviceControl").ButtonPress eHOME
				Wait 5
			End If
			intX = objSettingsIcon.GetROProperty("x")
			Wait 2
			intDeviceWidth = CInt(MobiDevice("deviceControl").GetROProperty("width") - 50)
			If intX > 0 AND intX < intDeviceWidth Then
				blnFound = True
			Else
				MobiDevice("deviceControl").ButtonPress eHOME
				Wait 10
				intX = objSettingsIcon.GetROProperty("x")
				Wait 5
				intDeviceWidth = CInt(MobiDevice("deviceControl").GetROProperty("width") - 50)
				
				If intX > 0 AND intX < intDeviceWidth Then
					blnFound = True
				Else
					Do While intX > intDeviceWidth
						MobiDevice("deviceControl").Draw "down(80%,50%) move(20%,50%,duration=2s) up()"
						Wait 3
						intX = objSettingsIcon.GetROProperty("x")
						Wait 2
						intDeviceWidth = CInt(MobiDevice("deviceControl").GetROProperty("width") - 50)
						
						If intX < intDeviceWidth Then
							blnFound = True
							Exit Do
						End If
					Loop
				End If
			End If
			
			If blnFound Then
				objSettingsIcon.Click
			Else
				MsgBox "Settings not found, please check the device screen!"
			End If
			
			intAttempts = 0
			Do While Not(MobiDevice("iOS").MobiElement("SettingsTitle").Exist(2))
				If MobiDevice("iOS").MobiButton("Back").Exist(5) Then
					MobiDevice("iOS").MobiButton("Back").Click
					'MobiButton("accessibilitylabel:=Back","nativebaseclass:=UINavigationBarBackIndicatorView").Click
				End If
				Wait 3
				If MobiDevice("iOS").MobiElement("SettingsTitle").Exist(2) Then
					Print "On Settings screen!"
					Exit Do
				End If
				intAttempts = intAttempts + 1
				If intAttempts > 10 Then
					Print "Couldn't get to the Settings screen in 10 attempts!"
					Exit Do
				End If
			Loop
			
			'Scroll to the top
			MobiDevice("iOS").MobiList("SettingsList").Scroll eTOP
			Wait 2
			
		Case "android"
			MobiDevice("deviceControl").ButtonPress eHOME
			Wait 3
			
			If MobiDevice("deviceControl").MobiElement("SayOkGoogle").Exist(5) Then
				MobiDevice("deviceControl").MobiElement("SayOkGoogle").Click
			ElseIf MobiDevice("deviceControl").MobiImage("GoogleMikeIcon").Exist(5) Then
				MobiDevice("deviceControl").MobiImage("GoogleMikeIcon").Click -10,10
			End If
			
			If MobiDevice("deviceControl").MobiButton("NOTHANKS").Exist(5) Then
				MobiDevice("deviceControl").MobiButton("NOTHANKS").Click
			ElseIf MobiDevice("deviceControl").MobiButton("SKIP").Exist(5) Then
				MobiDevice("deviceControl").MobiButton("SKIP").Click
			End If
			
			Wait 4
			MobiDevice("deviceControl").Type "settings"
			MobiDevice("deviceControl").MobiElement("Settings").WaitProperty "visible", True, 10000
			MobiDevice("deviceControl").MobiElement("Settings").Click
			Wait 2
		Case Else
			MsgBox "Couldn't get device platform, exiting test!"
			ExitTest
	End Select

	Set objSettingsIcon = Nothing
End Sub

'#################################################
Sub goToHomeScreen
	strPlatform = LCase(MobiDevice("deviceControl").GetROProperty("platform"))
	If strPlatform = "iphone os" Then
		strPlatform = "ios"
	ElseIf strPlatform = "androidos" Then
		strPlatform = "android"
	End If
	
	Select Case strPlatform
		Case "ios"
			Set objBack = MobiDevice("GEICO Mobile").MobiButton("Back_iOS")
		Case "android"
			Set objBack = MobiDevice("GEICO Mobile").MobiImage("BackButton")
	End Select
	
	intTries = 0	
	Do While objBack.Exist(2)
		objBack.Click
		Wait 2
		intTries = intTries + 1
		If intTries > 10 Then
			Print "Home screen not loaded after clicking the Back image 10 times!"
			Exit Do
		End If
	Loop
	
	Set objBack = Nothing
End Sub

'#################################################

Function FitViewerIntoDesktop
	
	'Wait for the viewer to connect
	If MobiDevice("name:=*").Exist(60) then
	
		FitViewerIntoDesktop = True
		
		If Window("regexpwndtitle:=.*deviceViewer","height:=228").Exist(2) Then
			FitViewerIntoDesktop = False
			Exit Function
		End If
		
		'Update the viewer scale if MobiDevice height is more than the screen height
		intScreenHeight = Window("object class:=Shell_TrayWnd").GetROProperty("height") + Window("object class:=Shell_TrayWnd").GetROProperty("y")
		intWindowHeight = Window("title:=.*deviceViewer").GetROProperty("height")
		
		'Move the deviceViewer Window near the top left of the screen
		Window("title:=.*deviceViewer").Move 15,10
		Wait 5
		
		intStartTime = Now()
		intScaleDown = 25
		
		Do While intWindowHeight > intScreenHeight
		    intScale = CInt(MobiDevice("name:=*").GetROProperty("viewerscale"))
		    intSetScale = Abs(CInt(intScale - intScaleDown))
		    'Scale down to 25% at most
		    If intSetScale >= 25 Then
		    	MobiDevice("name:=*").Scale intSetScale
		    ElseIf (intScale - 25) < 0 Then
		    	Print "The current viewer scale is: " & intScale
		    	Exit Do
		    End If
		    
		    'Sync for the scale down
		    Window("title:=.*deviceViewer").WaitProperty "height", micLessThan(intWindowHeight), 5000
		    intWindowHeight = Window("title:=.*deviceViewer").GetROProperty("height")
		    
		    'Exit if viewer height is lessthanOrequalTo 600 OR 2 minutes have passed attempting to scale down
		    'Keeping 600 as the minimum height as this would fit into most of the monitors
		    If intWindowHeight <= 600 Then
		        Exit Do
		    ElseIf Minute(Now() - intStartTime) >= 2 Then
		    	Print "[WARNING] Failed to scale down the device. The current viewer scale is: " & intScale
		    	Exit Do
		    End If
		    intScaleDown = intScaleDown-5
		    If intScaleDown = 0 Then
		    	intScaleDown = 5
		    End If
		Loop
		
	Else
		FitViewerIntoDesktop = False
	End if

End Function

Function ClickHighlight(objTest)
	objTest.Highlight
	x = CInt((objTest.GetROProperty("x") + (objTest.GetROProperty("x") + objTest.GetROProperty("width")))/2)
	y = CInt((objTest.GetROProperty("y") + (objTest.GetROProperty("y") + objTest.GetROProperty("height")))/2)
	MobiDevice("deviceControl").Draw "down(" & x & "," & y & ") up()"
End Function

'#################################################



'#################################################


